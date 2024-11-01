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
  const [imagePreview, setImagePreview] = useState();
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

    if (name === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.firstName) {
      toast({
        variant: 'destructive',
        description: 'First name is required.',
      });
      setLoading(false);
      return;
    }

    if (!formData.lastName) {
      toast({
        variant: 'destructive',
        description: 'Last name is required.',
      });
      setLoading(false);
      return;
    }

    if (!formData.email) {
      toast({
        variant: 'destructive',
        description: 'Email is required.',
      });
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      toast({
        variant: 'destructive',
        description: 'Phone number is required.',
      });
      setLoading(false);
      return;
    }

    // Reference to Firebase storage
    const storage = getStorage();

    // Check if image is a new file or an existing URL
    const isNewImage = formData.image && typeof formData.image !== 'string';
    let imageUrl = formData.image;

    if (isNewImage) {
      // If a new image file is selected, upload it
      const storageRef = ref(storage, `images/${formData.image.name}`);
      await uploadBytes(storageRef, formData.image);
      imageUrl = await getDownloadURL(storageRef);
    } else if (!imageUrl) {
      // If no image is provided and no existing image URL, show error
      toast({
        variant: 'destructive',
        description: 'Please upload an image.',
      });
      setLoading(false);
      return;
    }

    // Construct user object with updated data
    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      image: imageUrl,
    };

    try {
      if (editUserId) {
        // Update existing user
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
      } else {
        // Add new user
        const docRef = await addDoc(collection(db, 'users'), newUser);
        setUsers([...users, { id: docRef.id, ...newUser }]);
        toast({
          description: 'User added successfully.',
        });
      }
    } catch (error) {
      console.error('Error updating or adding user: ', error);
      toast({
        variant: 'destructive',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        image: null,
      });
      setImagePreview(null);
      window.location.reload();
    }
  };

  const editUser = (user) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      image: user.image,
    });
    setImagePreview(user.image);
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

  //TODO:Validations and Edit Fun for image

  return (
    // <div className="p-6 bg-gray-50 mx-auto">
    //   <h1 className="text-2xl font-bold mb-4">User Management</h1>
    //   {imagePreview && <img src={imagePreview} className="w-32 h-32 m-2" />}
    //   <form onSubmit={handleSubmit} className="mb-6">
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <Input
    //         name="firstName"
    //         placeholder="First Name"
    //         value={formData.firstName}
    //         onChange={handleChange}
    //       />
    //       <Input
    //         name="lastName"
    //         placeholder="Last Name"
    //         value={formData.lastName}
    //         onChange={handleChange}
    //       />
    //       <Input
    //         name="email"
    //         type="email"
    //         placeholder="Email"
    //         value={formData.email}
    //         onChange={handleChange}
    //       />
    //       <Input
    //         name="phone"
    //         type="tel"
    //         placeholder="Phone"
    //         value={formData.phone}
    //         onChange={handleChange}
    //       />
    //       <Input name="image" type="file" onChange={handleChange} />
    //       <Button disabled={loading} type="submit">
    //         {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    //         {loading ? 'Please wait' : editUserId ? 'Update User' : 'Add User'}
    //       </Button>
    //     </div>
    //   </form>
    //   <Button onClick={fetchUsers} className="mb-4">
    //     Refresh
    //   </Button>
    //   {fetchtingData ? (
    //     <div className="flex items-center justify-center h-[100vh]">
    //       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //     </div>
    //   ) : (
    //     <DynamicTabel
    //       data={users}
    //       caption="users"
    //       fieldsToRender={productTabelFields}
    //       handleDelete={(item) => deleteUser(item)}
    //       handleEdit={(item) => editUser(item)}
    //     />
    //   )}
    // </div>
    <div className="p-6 bg-gray-50 mx-auto max-w-screen-lg">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
        User Management
      </h1>
      {imagePreview && (
        <img src={imagePreview} className="w-32 h-32 m-2 mx-auto md:mx-0" />
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            name="image"
            type="file"
            onChange={handleChange}
            className="w-full"
          />
          <Button
            disabled={loading}
            type="submit"
            className="col-span-1 sm:col-span-2 lg:col-span-1 w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Please wait' : editUserId ? 'Update User' : 'Add User'}
          </Button>
        </div>
      </form>

      <Button onClick={fetchUsers} className="mb-4 w-full sm:w-auto">
        Refresh
      </Button>

      {fetchtingData ? (
        <div className="flex items-center justify-center h-[100vh]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      ) : (
        <DynamicTabel
          data={users}
          caption="users"
          fieldsToRender={productTabelFields}
          handleDelete={(item) => deleteUser(item)}
          handleEdit={(item) => editUser(item)}
          className="w-full overflow-x-auto"
        />
      )}
    </div>
  );
}
