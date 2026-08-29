
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  // Regex for 'EMP - 0123' format
  const employeeIdRegex = /^EMP - \d{4}$/;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!employeeIdRegex.test(userId)) {
      setError('Employee ID must be in the format "EMP - XXXX" (e.g., EMP - 0123).');
      setIsLoading(false);
      return;
    }

    if (password.length !== 4) {
      setError('Password must be 4 characters long.');
      setIsLoading(false);
      return;
    }

    const success = await login(userId, password);
    if (!success) {
      setError('Invalid Employee ID or Password.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoUserId: string, demoPassword: string) => {
    setError('');
    setIsLoading(true);
    setUserId(demoUserId);
    setPassword(demoPassword);
    
    const success = await login(demoUserId, demoPassword);
    if (!success) {
      setError('Invalid Employee ID or Password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:block lg:w-1/2 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')"}}>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Global Organization Inc.
            </h2>
            <p className="mt-2 text-sm text-gray-600">123 Business Rd, Metropolis</p>
            <h3 className="mt-4 text-xl font-semibold text-indigo-700">Centralized Document Management Information System</h3>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-4">
                  <p className="text-gray-600 font-medium">Login in to your account</p>
              </div>
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Employee ID:
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="e.g., EMP - 0123"
                  className="mt-1 block w-full px-3 py-2 border-b-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={4}
                  className="mt-1 block w-full px-3 py-2 border-b-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 text-center mb-4 font-medium">Demo Access (One-click Login)</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('EMP - 0123', 'admn')}
                  disabled={isLoading}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors font-medium disabled:opacity-50"
                >
                  Admin User
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('EMP - 0234', 'drc1')}
                  disabled={isLoading}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors font-medium disabled:opacity-50"
                >
                  IT Custodian
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('EMP - 0235', 'drc2')}
                  disabled={isLoading}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors font-medium disabled:opacity-50"
                >
                  HR Custodian
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('EMP - 0345', 'stf1')}
                  disabled={isLoading}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors font-medium disabled:opacity-50"
                >
                  Staff User
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Global Organization Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
