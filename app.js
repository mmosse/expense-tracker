import React, { useState, useContext, createContext } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Create a context for user authentication
const AuthContext = createContext(null);

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="p-4 max-w-4xl mx-auto">
        {view === 'login' && <Login setView={setView} />}
        {view === 'reset' && <ResetPassword setView={setView} />}
        {view === 'profile' && <Profile setView={setView} />}
        {view === 'main' && <ExpenseTracker setView={setView} />}
      </div>
    </AuthContext.Provider>
  );
};

const Login = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'michel.mosse@gmail.com' && password === '123456') {
      setUser({ email });
      setView('main');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-4">
        <button onClick={() => setView('reset')} className="text-blue-500">Forgot password?</button>
      </p>
    </div>
  );
};

const ResetPassword = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    if (email === 'michel.mosse@gmail.com') {
      setMessage('Password reset instructions sent to your email.');
    } else {
      setMessage('Email not found.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Reset Password</button>
      </form>
      {message && <p className="mt-2">{message}</p>}
      <p className="mt-4">
        <button onClick={() => setView('login')} className="text-blue-500">Back to Login</button>
      </p>
    </div>
  );
};

const Profile = ({ setView }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (currentPassword === '123456') {
      setMessage('Password changed successfully.');
      // In a real app, you would update the password on the server here
    } else {
      setMessage('Current password is incorrect.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p className="mb-4">Email: {user.email}</p>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Change Password</button>
      </form>
      {message && <p className="mt-2">{message}</p>}
      <p className="mt-4">
        <button onClick={() => setView('main')} className="text-blue-500">Back to Main</button>
      </p>
    </div>
  );
};

const ExpenseTracker = ({ setView }) => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    type: 'personal'
  });
  const { user, setUser } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const addTransaction = (e) => {
    e.preventDefault();
    setTransactions(prev => [...prev, { ...newTransaction, id: Date.now() }]);
    setNewTransaction({
      date: '',
      amount: '',
      currency: 'USD',
      category: '',
      description: '',
      type: 'personal'
    });
  };

  const calculateTotals = () => {
    return transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      acc[transaction.type] += amount;
      acc.total += amount;
      return acc;
    }, { personal: 0, professional: 0, total: 0 });
  };

  const totals = calculateTotals();

  const pieChartData = [
    { name: 'Personal', value: totals.personal },
    { name: 'Professional', value: totals.professional }
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  const categorySummary = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = { personal: 0, professional: 0 };
    }
    acc[transaction.category][transaction.type] += parseFloat(transaction.amount);
    return acc;
  }, {});

  const barChartData = Object.entries(categorySummary).map(([category, values]) => ({
    category,
    personal: values.personal,
    professional: values.professional
  }));

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const importedTransactions = parseCSV(csv);
        setTransactions(prev => [...prev, ...importedTransactions]);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      const transaction = headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i].trim();
        return obj;
      }, {});
      return { ...transaction, id: Date.now() + index };
    });
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div>
          <button onClick={() => setView('profile')} className="mr-2 bg-gray-500 text-white p-2 rounded">Profile</button>
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">Logout</button>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Import Transactions</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />
        <p className="text-sm text-gray-600 mt-1">
          Upload a CSV file with headers: date, amount, currency, category, description, type
        </p>
      </div>

      <form onSubmit={addTransaction} className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={newTransaction.date}
            onChange={handleInputChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="amount"
            value={newTransaction.amount}
            onChange={handleInputChange}
            placeholder="Amount"
            required
            className="border p-2 rounded"
          />
          <select
            name="currency"
            value={newTransaction.currency}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            type="text"
            name="category"
            value={newTransaction.category}
            onChange={handleInputChange}
            placeholder="Category"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="description"
            value={newTransaction.description}
            onChange={handleInputChange}
            placeholder="Description"
            required
            className="border p-2 rounded"
          />
          <select
            name="type"
            value={newTransaction.type}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option value="personal">Personal</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Add Transaction</button>
      </form>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Summary</h2>
        <p>Total: ${totals.total.toFixed(2)}</p>
        <p>Personal: ${totals.personal.toFixed(2)}</p>
        <p>Professional: ${totals.professional.toFixed(2)}</p>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Expense Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={pieChartData}
              cx={150}
              cy={150}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div>
          <h3 className="text-lg font-bold">Category Breakdown</h3>
          <BarChart width={400} height={300} data={barChartData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="personal" fill="#0088FE" />
            <Bar dataKey="professional" fill="#00C49F" />
          </BarChart>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Transactions</h2>
        <ul>
          {transactions.map(transaction => (
            <li key={transaction.id} className="mb-2 p-2 border rounded">
              {transaction.date} - {transaction.description} - ${transaction.amount} ({transaction.currency}) - {transaction.category} - {transaction.type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
