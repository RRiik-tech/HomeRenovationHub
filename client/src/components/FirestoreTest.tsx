import React, { useState, useEffect } from 'react';
import { firestoreUtils, usersCollection } from '../lib/firestore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function FirestoreTest() {
  const [users, setUsers] = useState<any[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await firestoreUtils.getCollection(usersCollection);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestUser = async () => {
    if (!newUserName.trim()) return;
    
    setLoading(true);
    try {
      await firestoreUtils.addDocument(usersCollection, {
        username: newUserName,
        email: `${newUserName}@example.com`,
        firstName: newUserName,
        lastName: 'Test',
        userType: 'homeowner',
        isVerified: false
      });
      setNewUserName('');
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Firestore Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter test user name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            disabled={loading}
          />
          <Button onClick={addTestUser} disabled={loading || !newUserName.trim()}>
            {loading ? 'Adding...' : 'Add Test User'}
          </Button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Users in Firestore:</h3>
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found. Add a test user to verify the connection.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="p-2 border rounded">
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Type:</strong> {user.userType}</p>
                  <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button onClick={loadUsers} variant="outline" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Users'}
        </Button>
      </CardContent>
    </Card>
  );
} 