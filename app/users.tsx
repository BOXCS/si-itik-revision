// // pages/users.tsx
// import { useEffect, useState } from "react";
// import { fetchUsers } from "@/lib/fetchUsers"; // Pastikan import fungsi fetchUsers yang benar
// import '@/app/users.css'; // Import CSS untuk styling

// const UsersPage = () => {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const userData = await fetchUsers();
//         setUsers(userData);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUsers();
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div>
//       <h1>Data Pengguna</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Username</th>
//             <th>Email</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.id}>
//               <td>{user.id}</td>
//               <td>{user.username}</td>
//               <td>{user.email}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UsersPage;
