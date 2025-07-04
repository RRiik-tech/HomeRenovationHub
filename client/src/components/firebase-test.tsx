import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, User, Database, Key } from 'lucide-react';
import { 
  signInWithGoogle, 
  firebaseSignOut, 
  onAuthStateChange, 
  getCurrentFirebaseUser,
  isFirebaseConfigured,
  db
} from '../lib/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

interface FirebaseTestProps {
  className?: string;
}

export const FirebaseTest: React.FC<FirebaseTestProps> = ({ className }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({
    config: false,
    auth: false,
    firestore: false,
    error: null as string | null
  });

  useEffect(() => {
    // Test Firebase configuration
    setTestResults(prev => ({
      ...prev,
      config: isFirebaseConfigured
    }));

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setTestResults(prev => ({
        ...prev,
        auth: !!user
      }));
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setTestResults(prev => ({ ...prev, error: null }));
    
    try {
      await signInWithGoogle();
      console.log('Sign in initiated...');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setTestResults(prev => ({
        ...prev,
        error: error.message || 'Sign in failed'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      setUser(null);
      setTestResults(prev => ({
        ...prev,
        auth: false,
        firestore: false
      }));
    } catch (error: any) {
      console.error('Sign out error:', error);
      setTestResults(prev => ({
        ...prev,
        error: error.message || 'Sign out failed'
      }));
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    if (!db) {
      setTestResults(prev => ({
        ...prev,
        error: 'Firestore not initialized'
      }));
      return;
    }

    setLoading(true);
    try {
      // Test write operation
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Firebase test',
        timestamp: new Date(),
        user: user?.email || 'anonymous'
      });
      
      console.log('Test document written with ID:', testDoc.id);

      // Test read operation
      const testQuery = query(collection(db, 'test'), limit(1));
      const querySnapshot = await getDocs(testQuery);
      
      console.log('Test documents read:', querySnapshot.size);

      setTestResults(prev => ({
        ...prev,
        firestore: true,
        error: null
      }));
    } catch (error: any) {
      console.error('Firestore test error:', error);
      setTestResults(prev => ({
        ...prev,
        firestore: false,
        error: error.message || 'Firestore test failed'
      }));
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Firebase Connection Test
        </CardTitle>
        <CardDescription>
          Test Firebase authentication and Firestore database connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <StatusIcon status={testResults.config} />
            <span className="font-medium">Firebase Configuration</span>
          </div>
          <span className="text-sm text-gray-600">
            {testResults.config ? 'Configured' : 'Not configured'}
          </span>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <StatusIcon status={testResults.auth} />
            <span className="font-medium">Authentication</span>
          </div>
          <span className="text-sm text-gray-600">
            {user ? `Signed in as ${user.email}` : 'Not signed in'}
          </span>
        </div>

        {/* Firestore Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <StatusIcon status={testResults.firestore} />
            <span className="font-medium">Firestore Database</span>
          </div>
          <span className="text-sm text-gray-600">
            {testResults.firestore ? 'Connected' : 'Not tested'}
          </span>
        </div>

        {/* Current User Info */}
        {user && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Current User</span>
            </div>
            <div className="text-sm text-blue-800">
              <p>Email: {user.email}</p>
              <p>Name: {user.displayName}</p>
              <p>ID: {user.uid}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {testResults.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{testResults.error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!user ? (
            <Button 
              onClick={handleSignIn} 
              disabled={loading || !testResults.config}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sign In with Google
            </Button>
          ) : (
            <Button 
              onClick={handleSignOut} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sign Out
            </Button>
          )}
          
          <Button 
            onClick={testFirestore} 
            disabled={loading || !user}
            variant="secondary"
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Test Firestore
          </Button>
        </div>

        {/* Debug Info */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Debug Information
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({
              isFirebaseConfigured,
              hasUser: !!user,
              hasDb: !!db,
              projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
              hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
              hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}; 