
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length !== 4) {
            setMessage({ type: 'error', text: 'New password must be 4 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        
        // In a real app, you would call an API to change the password.
        // For this mock app, we'll just show a success message.
        console.log({
            userId: currentUser?.id,
            oldPassword,
            newPassword
        });
        
        setMessage({ type: 'success', text: 'Password changed successfully! (mock)' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
            <div className="space-y-4 mb-8">
                <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-lg text-gray-900">{currentUser?.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-lg text-gray-900">{currentUser?.id}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-lg text-gray-900">{currentUser?.role}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-lg text-gray-900">{currentUser?.department || 'N/A'}</p>
                </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Old Password</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required maxLength={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required maxLength={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                
                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}

                <div className="text-right">
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
