// D:\Projekty\AplikacjaWebowa\meal-planner-app\app\admin\page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    phone_number: number;
    password?: string;
    status: string;
}

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("user_management");
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showEditUserForm, setShowEditUserForm] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/users", {
                withCredentials: true,
            });
            console.log("Response: ", response.data);
            setUsers(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                console.log('fetchUsers: Unauthorized, redirecting to login.');
                router.push('/login?error=auth');
            } else {
                console.error("Error fetching users:", error);
                alert("Failed to fetch users from the server.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); 

    const handleLogout = useCallback(async () => { 
        try {
            await axios.post(
                "http://localhost:5000/api/logout",
                {},
                {
                    withCredentials: true,
                }
            );
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("token");
            router.push("/login");
        }
    }, [router]);

    const handleAddUser = async (userData: User) => {
        if (!userData.name || !userData.email || !userData.password) {
            alert("Please fill in all fields, including password.");
            return false;
        }
        if (users.some(user => user.email === userData.email)) {
            alert("A user with this email already exists.");
            return false;
        }

        try {
            const dataToSend = {
                name: userData.name,
                email: userData.email,
                phone_number: userData.phone_number,
                password: userData.password,
            };
            await axios.post("http://localhost:5000/api/users/add", dataToSend, {
                withCredentials: true,
            });
            await fetchUsers(); // Refresh the list
            alert("User added successfully!");
            setShowAddUserForm(false);
            return true;
        } catch (error) {
            console.error("Error adding user:", error);
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    alert("Authorisation error.");
                    handleLogout();
                } else if (error.response.status === 400) {
                    alert(`Data error: ${error.response.data.message || 'Invalid data.'}`);
                } else {
                    alert(`Server error: ${error.response.status} - ${error.response.data.message || 'An unknown error occurred.'}`);
                }
            } else {
                alert("Error while connecting with the server. Please check your internet connection.");
            }
            return false;
        }
    };

    const handleEditUser = async (userData: User) => {
        if (!userData.name || !userData.email) {
            alert("Please fill in all fields.");
            return false;
        }
        if (users.some(user => user.email === userData.email && user.id !== userData.id)) {
            alert("A user with this email already exists.");
            return false;
        }
        try {
            const dataToSend = {
                id_account: userData.id,
                email: userData.email,
                name: userData.name,
                phone_number: userData.phone_number,
            }
            await axios.put(`http://localhost:5000/api/users/change`, dataToSend, {
                withCredentials: true,
            });
            await fetchUsers(); // Refresh the list
            setShowEditUserForm(false);
            return true;
        } catch (error) {
            console.error("Error updating user:", error);
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    alert("Authorisation error.");
                    handleLogout();
                } else if (error.response.status === 400) {
                    alert(`Data error: ${error.response.data.message || 'Invalid data.'}`);
                } else {
                    alert(`Server error: ${error.response.status} - ${error.response.data.message || 'An unknown error occurred.'}`);
                }
            } else {
                alert("Error while connecting with the server. Please check your internet connection.");
            }
            return false;
        }
    }

    const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'activated' ? 'deactivated' : 'activated';
        const confirmMessage = `Do you really want to ${newStatus === 'deactivated' ? 'deactivate' : 'activate'} this account?`;

        if (window.confirm(confirmMessage)) {
            try {
                await axios.put(`http://localhost:5000/api/users/toggle-status`, {
                    id_account: userId,
                    status: newStatus,
                }, {
                    withCredentials: true
                });
                alert(`User account ${newStatus} successfully.`);
                await fetchUsers();
                return true;
            } catch (error) {
                console.error(`Error toggling user status to ${newStatus}:`, error);
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 401) {
                        alert("Authorisation error.");
                        handleLogout();
                    } else if (error.response.status === 400) {
                        alert(`Data error: ${error.response.data.message || 'Invalid data.'}`);
                    } else {
                        alert(`Server error: ${error.response.status} - ${error.response.data.message || 'An unknown error occurred.'}`);
                    }
                } else {
                    alert("Error while connecting with the server. Please check your internet connection.");
                }
                return false;
            }
        }
        return false;
    };

    const renderContent = () => {
        switch (activeTab) {
            case "user_management":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Management panel</h2>

                        {/* Panel zarządzania: Przyciski */}
                        <div className="flex justify-between items-center bg-gray-700 p-3 rounded-t-lg mb-4">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                                onClick={() => { setShowAddUserForm(true); setShowEditUserForm(false); }}
                            >
                                <Plus size={18} className="mr-2" />
                                Add user
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>

                        {showAddUserForm && (
                            <UserForm
                                key="addUserForm"
                                title="Add New User"
                                onSubmit={handleAddUser}
                                onCancel={() => setShowAddUserForm(false)}
                            />
                        )}

                        {showEditUserForm && currentUser && (
                            <UserForm
                                key={`editUserForm-${currentUser.id}`}
                                title="Edit User Data"
                                initialData={currentUser}
                                onSubmit={handleEditUser}
                                onCancel={() => { setShowEditUserForm(false); setCurrentUser(null); }}
                            />
                        )}

                        {/* Panel zarządzania - lista użytkowników */}
                        <div className="bg-gray-700 p-4 rounded-b-lg">
                            <h3 className="text-xl font-semibold mb-3">Management Panel - User List</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-800 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-600 text-left">
                                            <th className="py-2 px-4 border-b border-gray-700">#</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Username</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Email</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Phone Number</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Status</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((user, index) => (
                                                <tr key={user.id} className="hover:bg-gray-700">
                                                    <td className="py-2 px-4 border-b border-gray-700">{index + 1}</td>
                                                    <td className="py-2 px-4 border-b border-gray-700">{user.name}</td>
                                                    <td className="py-2 px-4 border-b border-gray-700">{user.email}</td>
                                                    <td className="py-2 px-4 border-b border-gray-700">{user.phone_number}</td>
                                                    <td className="py-2 px-4 border-b border-gray-700">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'activated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {user.status === 'activated' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-4 border-b border-gray-700 flex space-x-2">
                                                        <button
                                                            className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded flex items-center"
                                                            onClick={() => { setShowEditUserForm(true); setShowAddUserForm(false); setCurrentUser(user); }}
                                                        >
                                                            <Edit size={16} className="mr-1" />
                                                            Edit Data
                                                        </button>
                                                        <button
                                                            className={`${user.status === 'activated' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-1 px-3 rounded flex items-center`}
                                                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                                                        >
                                                            <Trash2 size={16} className="mr-1" />
                                                            {user.status === 'activated' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-4 text-center text-gray-400">No users to display.</td>
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

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-90">
                <Loading />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <div className="flex flex-1">
                <aside className="w-64 bg-gray-800 p-4 space-y-4">
                    <h1 className="text-2xl font-bold">Admin</h1>
                    <nav className="space-y-2">
                        <button
                            onClick={() => { setActiveTab("user_management"); setShowAddUserForm(false); setShowEditUserForm(false); setCurrentUser(null); }}
                            className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700 ${activeTab === "user_management" ? "bg-gray-700" : ""}`}
                        >
                            User Management
                        </button>
                    </nav>
                </aside>

                <main className="flex-1">{renderContent()}</main>
            </div>

            <footer className="bg-gray-800 py-4 text-center mt-auto">
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
        phone_number: number;
        password?: string;
    };
    onSubmit: (data: User) => Promise<boolean>;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ title, initialData = { name: "", email: "", phone_number: 0 }, onSubmit, onCancel }) => {
    const [name, setName] = useState(() => initialData.name);
    const [email, setEmail] = useState(() => initialData.email);
    const [password, setPassword] = useState(() => initialData.password || "");
    const id = initialData.id;
    const [phone_number_input, setPhone_number_input] = useState<number | ''>(() =>
        initialData.phone_number === 0 ? '' : initialData.phone_number
    );

    useEffect(() => {
        setName(initialData.name);
        setEmail(initialData.email);
        setPassword(initialData.password || "");
        setPhone_number_input(initialData.phone_number === 0 ? '' : initialData.phone_number);
    }, [initialData.id, initialData.name, initialData.email, initialData.phone_number, initialData.password]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let phoneNumberForAPI: number;
        if (phone_number_input === '') {
            phoneNumberForAPI = 0;
        } else {
            const parsedNumber = Number(phone_number_input);
            phoneNumberForAPI = isNaN(parsedNumber) ? 0 : parsedNumber;
        }

        const dataToSubmit: User = {
            id: id ?? 0,
            name,
            email,
            phone_number: phoneNumberForAPI,
            status: 'activated' 
        };

        const isAddingUser = initialData.id === undefined; 
        if (isAddingUser) {
            dataToSubmit.password = password;
        }

        await onSubmit(dataToSubmit);
    };


    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                        Username:
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
                <div className="mb-4">
                    <label htmlFor="phone_number" className="block text-gray-300 text-sm font-bold mb-2">
                        Phone Number:
                    </label>
                    <input
                        type="number"
                        id="phone_number"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
                        value={phone_number_input}
                        onChange={(e) =>
                            setPhone_number_input(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        required
                    />
                </div>
                {/* Only show password field when adding a new user */}
                {!initialData.id && (
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={!initialData.id}
                        />
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPage;