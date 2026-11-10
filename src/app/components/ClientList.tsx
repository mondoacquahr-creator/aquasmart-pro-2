import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Users, PlusCircle, MapPin, Trash2, Pencil } from 'lucide-react';
import { storage } from '../lib/storage';
import { Client } from '../types';

export function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const allClients = storage.getClients().sort((a, b) => 
      a.name.localeCompare(b.name, 'hr', { sensitivity: 'base' })
    );
    setClients(allClients);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client: Client = {
      id: Date.now().toString(),
      name: formData.name,
      contact: formData.contact,
      location: {
        address: formData.address,
      },
      notes: formData.notes,
    };

    storage.saveClient(client);
    setClients([...clients, client]);
    setShowAddForm(false);
    setFormData({ name: '', contact: '', address: '', notes: '' });
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client: Client = {
      id: editingClientId!,
      name: formData.name,
      contact: formData.contact,
      location: {
        address: formData.address,
      },
      notes: formData.notes,
    };

    storage.saveClient(client);
    setClients(clients.map(c => c.id === editingClientId ? client : c));
    setShowAddForm(false);
    setEditingClientId(null);
    setFormData({ name: '', contact: '', address: '', notes: '' });
  };

  const startEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setFormData({
      name: client.name,
      contact: client.contact || '',
      address: client.address || client.location?.address || '',
      notes: client.notes || '',
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingClientId(null);
    setFormData({ name: '', contact: '', address: '', notes: '' });
  };

  const getPoolsForClient = (clientId: string) => {
    return storage.getPools().filter(p => p.clientId === clientId);
  };

  const handleDeleteClient = (clientId: string, clientName: string, poolCount: number) => {
    const confirmMessage = poolCount > 0 
      ? `Jeste li sigurni da želite obrisati klijenta "${clientName}"?\n\nOVAJ KLIJENT IMA ${poolCount} ${poolCount === 1 ? 'BAZEN' : 'BAZENA'}!\nBrisanjem klijenta će se obrisati i svi njegovi bazeni, analize i radni nalozi.`
      : `Jeste li sigurni da želite obrisati klijenta "${clientName}"?`;
    
    if (window.confirm(confirmMessage)) {
      storage.deleteClient(clientId);
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate('/app')} 
            className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Klijenti
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraži klijente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (showAddForm && editingClientId) {
              cancelEdit();
            }
            setShowAddForm(!showAddForm);
          }}
          className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <PlusCircle className="w-5 h-5" />
          Dodaj novog klijenta
        </button>

        {showAddForm && (
          <form onSubmit={editingClientId ? handleEditClient : handleAddClient} className="bg-white rounded-lg shadow-md p-6 mb-4 space-y-4">
            <h3 className="text-lg font-medium mb-4">
              {editingClientId ? 'Uredi klijenta' : 'Novi klijent'}
            </h3>
            
            <div>
              <label className="block text-sm mb-2">Ime / Naziv *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Kontakt</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Telefon / Email"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Adresa</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Napomene</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Spremi
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Odustani
              </button>
            </div>
          </form>
        )}

        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nema rezultata pretrage' : 'Nema klijenata'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const clientPools = getPoolsForClient(client.id);
              return (
                <div
                  key={client.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-start justify-between gap-3"
                >
                  <button
                    onClick={() => navigate(`/app/clients/${client.id}`)}
                    className="flex-1 text-left"
                  >
                    <h3 className="text-lg mb-2">{client.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {(client.phone || client.contact) && <div>📞 {client.phone || client.contact}</div>}
                      {(client.address || client.location?.address) && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          {client.address || client.location?.address}
                        </div>
                      )}
                      <div className="text-blue-600 font-medium">
                        {clientPools.length} {clientPools.length === 1 ? 'bazen' : 'bazena'}
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditClient(client);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Uredi klijenta"
                    >
                      <Pencil className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id, client.name, clientPools.length);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Obriši klijenta"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}