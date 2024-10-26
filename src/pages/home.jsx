// src/App.jsx
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import DynamicTabel from '@/components/custom/SimpleTabel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchtingData, setfetchtingData] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    image: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setfetchtingData(true);
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
    setfetchtingData(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const storage = getStorage();
    const imageFile = formData.image;

    if (!imageFile) {
      toast({
        variant: 'destructive',
        description: 'Please upload an image.',
      });
      setLoading(false);
      return;
    }

    const storageRef = ref(storage, `images/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      image: imageUrl,
    };

    if (editUserId) {
      const userDoc = doc(db, 'users', editUserId);
      await updateDoc(userDoc, newUser);
      setUsers(
        users.map((user) =>
          user.id === editUserId ? { id: editUserId, ...newUser } : user
        )
      );
      setEditUserId(null);
      toast({
        description: 'User updated successfully.',
      });
      setLoading(false);
    } else {
      const docRef = await addDoc(collection(db, 'users'), newUser);
      setUsers([...users, { id: docRef.id, ...newUser }]);
      toast({
        description: 'User added successfully.',
      });
      setLoading(false);
    }
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      image: null,
    });
  };

  const editUser = (user) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      image: null,
    });
    setEditUserId(user.id);
  };

  const deleteUser = async (userId) => {
    await deleteDoc(doc(db, 'users', userId.id));
    setUsers(users.filter((user) => user.id !== userId.id));
    toast({
      // variant: 'destructive',
      description: 'User deleted successfully',
    });
  };

  const productTabelFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'image', label: 'Image' },
  ];

  return (
    <div className="p-6 bg-gray-50 mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input name="image" type="file" onChange={handleChange} />
          <Button disabled={loading} type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Please wait' : editUserId ? 'Update User' : 'Add User'}
          </Button>
        </div>
      </form>
      <Button onClick={fetchUsers} className="mb-4">
        Refresh
      </Button>
      {fetchtingData ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <DynamicTabel
          data={users}
          caption="users"
          fieldsToRender={productTabelFields}
          handleDelete={(item) => deleteUser(item)}
          handleEdit={(item) => editUser(item)}
        />
      )}
    </div>
  );
}
