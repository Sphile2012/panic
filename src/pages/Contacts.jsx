import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entities, auth } from "@/api/client";
import { Plus } from "lucide-react";
import ContactCard from "@/components/contacts/ContactCard";
import ContactForm from "@/components/contacts/ContactForm";
import PageHeader from "@/components/ui/PageHeader";

export default function Contacts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => auth.me(),
    staleTime: 300000,
  });

  const { data: contacts = [], isLoading: loading } = useQuery({
    queryKey: ['contacts', user?.email],
    queryFn: () => entities.EmergencyContact.filter({ owner_email: user.email }, 'priority', 20),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['contacts', user?.email] });

  const { mutate: handleSave } = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        await entities.EmergencyContact.update(editing.id, data);
      } else {
        await entities.EmergencyContact.create({ ...data, owner_email: user.email });
      }
    },
    onSuccess: () => { invalidate(); setShowForm(false); setEditing(null); },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id) => entities.EmergencyContact.delete(id),
    onSuccess: invalidate,
  });

  const handleEdit = (contact) => { setEditing(contact); setShowForm(true); };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="max-w-md mx-auto px-4 pb-24 pt-6">

        <PageHeader
          title="Emergency Contacts"
          subtitle="Who to notify in an emergency"
          action={{ icon: Plus, onClick: () => { setEditing(null); setShowForm(true); }, label: "Add contact" }}
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-white font-semibold mb-1">No contacts yet</p>
            <p className="text-[#555] text-sm">Add trusted people who will receive your emergency alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <ContactCard key={c.id} contact={c} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {showForm && (
          <ContactForm
            contact={editing}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        )}

      </div>
    </div>
  );
}
