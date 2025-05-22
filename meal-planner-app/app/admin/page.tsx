"use client";

import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
// Usunięto importy Link i Image, ponieważ nie są potrzebne dla uproszczonej stopki

interface User {
    id : number;
    name : string;
    email: string;
  }

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("user_management");
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        console.log("Response: " + response.data.users);
        setUsers(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania użytkowników:", error);
        alert("Nie udało się pobrać użytkowników z serwera.");
      }
    };
  
    fetchUsers();
  }, []);

  const handleAddUser = (userData: User) => {
    // Basic validation
    if (!userData.name || !userData.email) {
      alert("Proszę wypełnić wszystkie pola.");
      return false;
    }
    if (users.some(user => user.email === userData.email)) {
      alert("Użytkownik o podanym adresie email już istnieje.");
      return false;
    }

    const newUser = { ...userData };
    setUsers([...users, newUser]);
    alert("Użytkownik dodany pomyślnie!");
    setShowAddUserForm(false);
    return true;
  };

  const handleEditUser = (userData : User) => {
    // Basic validation
    if (!userData.name || !userData.email) {
      alert("Proszę wypełnić wszystkie pola.");
      return false;
    }
     if (users.some(user => user.email === userData.email && user.id !== userData.id)) {
      alert("Użytkownik o podanym adresie email już istnieje.");
      return false;
    }

    setUsers(users.map((user) => (user.id === userData.id ? userData : user)));
    alert("Dane użytkownika zaktualizowane pomyślnie!");
    setShowEditUserForm(false);
    setCurrentUser(null);
    return true;
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Czy na pewno chcesz dezaktywować to konto?")) {
      setUsers(users.filter((user) => user.id !== userId));
      alert("Konto użytkownika dezaktywowane pomyślnie.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "user_management":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Panel zarządzania</h2>

            {/* Panel zarządzania: Przyciski */}
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-t-lg mb-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                onClick={() => { setShowAddUserForm(true); setShowEditUserForm(false); }}
              >
                <Plus size={18} className="mr-2" />
                Dodaj użytkownika
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Wyloguj się
              </button>
            </div>

            {showAddUserForm && (
              <UserForm
                title="Dodaj nowego użytkownika"
                onSubmit={handleAddUser}
                onCancel={() => setShowAddUserForm(false)}
              />
            )}

            {showEditUserForm && currentUser && (
              <UserForm
                title="Edytuj dane użytkownika"
                initialData={currentUser}
                onSubmit={handleEditUser}
                onCancel={() => { setShowEditUserForm(false); setCurrentUser(null); }}
              />
            )}

            {/* Panel zarządzania - lista użytkowników */}
            <div className="bg-gray-700 p-4 rounded-b-lg">
              <h3 className="text-xl font-semibold mb-3">Panel zarządzania - lista użytkowników</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="bg-gray-600 text-left">
                      <th className="py-2 px-4 border-b border-gray-700">#</th>
                      <th className="py-2 px-4 border-b border-gray-700">Nazwa użytkownika</th>
                      <th className="py-2 px-4 border-b border-gray-700">Email</th>
                      <th className="py-2 px-4 border-b border-gray-700">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-700">
                          <td className="py-2 px-4 border-b border-gray-700">{index + 1}</td>
                          <td className="py-2 px-4 border-b border-gray-700">{user.name}</td>
                          <td className="py-2 px-4 border-b border-gray-700">{user.email}</td>
                          <td className="py-2 px-4 border-b border-gray-700 flex space-x-2">
                            <button
                              className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded flex items-center"
                              onClick={() => { setShowEditUserForm(true); setShowAddUserForm(false); setCurrentUser(user); }}
                            >
                              <Edit size={16} className="mr-1" />
                              Edytuj dane
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded flex items-center"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Dezaktywuj
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-400">Brak użytkowników do wyświetlenia.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white"> {/* Dodano flex-col i min-h-screen */}
      <div className="flex flex-1"> {/* Ten div będzie rozciągał się, pchając stopkę na dół */}
        <aside className="w-64 bg-gray-800 p-4 space-y-4">
          <h1 className="text-2xl font-bold">Admin</h1>
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab("user_management"); setShowAddUserForm(false); setShowEditUserForm(false); setCurrentUser(null); }}
              className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700 ${activeTab === "user_management" ? "bg-gray-700" : ""}`}
            >
              Zarządzanie użytkownikami
            </button>
          </nav>
        </aside>

        <main className="flex-1">{renderContent()}</main>
      </div>

      {/* Stopka na samym dole, poza główną zawartością */}
      <footer className="bg-gray-800 py-4 text-center mt-auto"> {/* Użycie mt-auto do wypchnięcia na dół */}
        <p className="text-gray-400">&copy; 2025 mniamplan</p>
      </footer>
    </div>
  );
};

interface UserFormProps {
    title: string;
    initialData?: {
      id?: number;
      name: string;
      email: string;
    };
    onSubmit: (data: User) => void;
    onCancel: () => void;
  }

const UserForm: React.FC<UserFormProps> = ({ title, initialData = { name: "", email: "" }, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const id = initialData.id;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ id:  id ?? 0, name, email });
    setName("");
    setEmail("");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
            Nazwa użytkownika:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Zapisz
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;