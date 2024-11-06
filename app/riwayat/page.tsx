"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from "@/lib/firebase";
import { SidebarDemo } from '@/components/Sidebar';
import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface AnalysisPeriodData {
  id: string;
  created_at: Timestamp;
  bepHarga: number;
  bepHasil: number;
  laba: number;
  marginOfSafety: number;
  rcRatio: number;
}

interface PopupProps {
  open: boolean;
  onClose: () => void;
  data: AnalysisPeriodData | null;
}

const styles = {
  pageContainer: {
    background: 'linear-gradient(180deg, #FFD580, #FFCC80)',
    minHeight: '100vh',
    padding: '0px',
    margin: '0px',
    fontFamily: "'Arial', sans-serif",
  },
  contentContainer: {
    padding: '20px',
  },
  title: {
    color: '#333',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '15px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    width: '300px', // Atur lebar card
    height: '200px', // Atur tinggi card
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  time: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  date: {
    fontSize: '14px',
    color: '#777',
  },
  amount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: '14px',
    color: '#999',
  },
  popupTitle: {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  popupContent: {
    padding: '20px 0',
  },
};

function Popup({ open, onClose, data }: PopupProps) {
  if (!data) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle style={styles.popupTitle}>Detail Analisis</DialogTitle>
      <DialogContent style={styles.popupContent}>
        <Typography variant="h6" style={styles.time}>{data.created_at.toDate().toLocaleTimeString()}</Typography>
        <Typography variant="body2" style={styles.date}>{data.created_at.toDate().toLocaleDateString()}</Typography>
        <Typography variant="body1" style={styles.amount}>Rp. {data.bepHarga}</Typography>
        <Typography variant="body2" style={styles.description}>{data.marginOfSafety}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Dashboard() {
  const [username, setUsername] = useState<string>('User');
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<AnalysisPeriodData | null>(null);
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);
  const [userSpecificData, setUserSpecificData] = useState<AnalysisPeriodData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || 'User');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDataAnalisis = async () => {
      try {
        const q = query(collection(firestore, 'analisis_periode'));
        const querySnapshot = await getDocs(q);
        
        const data: AnalysisPeriodData[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          created_at: doc.data().created_at,
          bepHarga: doc.data().bepHarga,
          bepHasil: doc.data().bepHasil,
          laba: doc.data().laba,
          marginOfSafety: doc.data().marginOfSafety,
          rcRatio: doc.data().rcRatio,
        }));
        setDataAnalisis(data);
      } catch (error) {
        console.error("Error saat mengambil data analisis: ", error);
      }
    };

    fetchDataAnalisis();
  }, []);

  useEffect(() => {
    const fetchUserSpecificData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userEmail = user.email;
        const detailLayerQuery = query(
          collection(firestore, "detail_layer"),
          where("userId", "==", userEmail)
        );
        const querySnapshot = await getDocs(detailLayerQuery);

        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref;
          const subCollectionRef = collection(userDocRef, "detail_layer");
          const subCollectionSnapshot = await getDocs(subCollectionRef);

          const userData: AnalysisPeriodData[] = subCollectionSnapshot.docs.map((doc) => ({
            id: doc.id,
            created_at: doc.data().created_at || Timestamp.now(),
            bepHarga: doc.data().hasilAnalisis?.bepHarga ?? 0,
            bepHasil: doc.data().hasilAnalisis?.bepHasil ?? 0,
            laba: doc.data().hasilAnalisis?.laba ?? 0,
            marginOfSafety: doc.data().hasilAnalisis?.marginOfSafety ?? 0,
            rcRatio: doc.data().hasilAnalisis?.rcRatio ?? 0,
          }));
          setUserSpecificData(userData);
        } else {
          console.error("Dokumen tidak ditemukan untuk email yang diberikan!");
        }
      } catch (error) {
        console.error("Error mengambil data: ", error);
      }
    };

    fetchUserSpecificData();
  }, []);

  const handleCardClick = (data: AnalysisPeriodData) => {
    setSelectedData(data);
    setOpenPopup(true);
  };

  return (
    <div style={styles.pageContainer}>
      <SidebarDemo>
        <div style={styles.contentContainer}>
          <h1 style={styles.title}>Halo, {username}</h1>
          <Grid container spacing={3}>
            {/* Card untuk Riwayat Analisis */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" style={styles.sectionTitle}>Riwayat Analisis</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card style={styles.card} onClick={() => handleCardClick(userSpecificData[0])}>
                    <CardContent>
                      <Typography variant="h6" style={styles.time}>User-Specific Data</Typography>
                        {userSpecificData.map((data) => (
                      <Card key={data.id} style={styles.card} onClick={() => handleCardClick(data)}>
                        <CardContent>
                          <Typography variant="h6" style={styles.time}>ID: {data.id}</Typography>
                          <Typography variant="body2" style={styles.date}>
                            Created At: {data.created_at.toDate().toLocaleDateString()} {data.created_at.toDate().toLocaleTimeString()}
                          </Typography>
                          <Typography variant="body1" style={styles.amount}>Break-even Price (bepHarga): Rp. {data.bepHarga}</Typography>
                          <Typography variant="body1" style={styles.amount}>Break-even Result (bepHasil): Rp. {data.bepHasil}</Typography>
                          <Typography variant="body1" style={styles.amount}>Profit (laba): Rp. {data.laba}</Typography>
                          <Typography variant="body2" style={styles.description}>Margin of Safety: {data.marginOfSafety}</Typography>
                          <Typography variant="body2" style={styles.description}>RC Ratio: {data.rcRatio}</Typography>
                        </CardContent>
                      </Card>
                      ))}

                      <Typography variant="h6" style={styles.time}>General Analysis Data</Typography>
                      {dataAnalisis.map((data, index) => (
                        <div key={index}>
                          <Typography variant="body2" style={styles.date}>{data.created_at.toDate().toLocaleDateString()}</Typography>
                          <Typography variant="body1" style={styles.amount}>Rp. {data.bepHarga}</Typography>
                          <Typography variant="body2" style={styles.description}>{data.marginOfSafety}</Typography>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Popup open={openPopup} onClose={() => setOpenPopup(false)} data={selectedData} />
        </div>
      </SidebarDemo>
    </div>
  );
}

// import React, { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { firestore, auth } from "@/lib/firebase";  // Pastikan firestore dan auth sudah diekspor dari konfigurasi firebase Anda
// import { SidebarDemo } from '@/components/Sidebar';
// import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// interface AnalysisPeriodData {
//   id: string;
//   created_at: Timestamp;
//   bepHarga: number;
//   bepHasil: number;
//   laba: number;
//   marginOfSafety: number;
//   rcRatio: number;
// }

// interface PopupProps {
//   open: boolean;
//   onClose: () => void;
//   data: AnalysisPeriodData | null;
// }


// const styles = {
//   pageContainer: {
//     background: 'linear-gradient(180deg, #FFD580, #FFCC80)',
//     minHeight: '100vh',
//     padding: '0px',
//     margin: '0px',
//     fontFamily: "'Arial', sans-serif",
//   },
//   contentContainer: {
//     padding: '20px',
//   },
//   title: {
//     color: '#333',
//     marginBottom: '20px',
//   },
//   sectionTitle: {
//     color: '#333',
//     marginBottom: '15px',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: '12px',
//     boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
//     padding: '15px',
//     cursor: 'pointer',
//     transition: 'transform 0.2s',
//     '&:hover': {
//       transform: 'scale(1.02)',
//     },
//   },
//   emptyCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: '12px',
//     boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
//     padding: '15px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   time: {
//     fontSize: '16px',
//     fontWeight: 'bold',
//   },
//   date: {
//     fontSize: '14px',
//     color: '#777',
//   },
//   amount: {
//     fontSize: '18px',
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   description: {
//     fontSize: '14px',
//     color: '#999',
//   },
//   popupTitle: {
//     borderBottom: '1px solid #eee',
//     paddingBottom: '10px',
//   },
//   popupContent: {
//     padding: '20px 0',
//   },
// };

// function Popup({ open, onClose, data }: PopupProps) {
//   if (!data) return null;

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose}
//       maxWidth="sm"
//       fullWidth
//     >
//       <DialogTitle style={styles.popupTitle}>Detail Analisis</DialogTitle>
//       <DialogContent style={styles.popupContent}>
//         <Typography variant="h6" style={styles.time}>{data.created_at.toDate().toLocaleTimeString()}</Typography>
//         <Typography variant="body2" style={styles.date}>{data.created_at.toDate().toLocaleDateString()}</Typography>
//         <Typography variant="body1" style={styles.amount}>Rp. {data.bepHarga}</Typography>
//         <Typography variant="body2" style={styles.description}>{data.marginOfSafety}</Typography>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="primary">
//           Tutup
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }
// function UserSpecificData() {
//   const [data, setData] = useState<AnalysisPeriodData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userEmail, setUserEmail] = useState<string | null>(null);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserEmail(user.email!);
//       } else {
//         console.error("Pengguna tidak login!");
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (!userEmail) return;

//     const fetchUserData = async () => {
//       try {
//         console.log("Mencari dokumen dengan email:", userEmail);
//         const detailLayerQuery = query(
//           collection(firestore, "detail_layer"),
//           where("userId", "==", userEmail)
//         );
//         const querySnapshot = await getDocs(detailLayerQuery);

//         if (!querySnapshot.empty) {
//           const userDocRef = querySnapshot.docs[0].ref;
//           const subCollectionRef = collection(userDocRef, "analisis_periode");
//           const subCollectionSnapshot = await getDocs(subCollectionRef);

//           const fetchedData: AnalysisPeriodData[] = subCollectionSnapshot.docs.map((doc) => {
//             const docData = doc.data();
//             console.log("Data Dokumen:", docData);

//             const hasilAnalisis = docData.hasilAnalisis || {};

//             return {
//               id: doc.id,
//               created_at: docData.created_at || Timestamp.now(),
//               bepHarga: hasilAnalisis.bepHarga ?? 0,
//               bepHasil: hasilAnalisis.bepHasil ?? 0,
//               laba: hasilAnalisis.laba ?? 0,
//               marginOfSafety: hasilAnalisis.marginOfSafety ?? 0,
//               rcRatio: hasilAnalisis.rcRatio ?? 0,
//             };
//           });

//           setData(fetchedData);
//           console.log("Data yang di-set:", fetchedData);
//         } else {
//           console.error("Dokumen tidak ditemukan untuk email yang diberikan!");
//         }
//       } catch (error) {
//         console.error("Error mengambil data: ", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [userEmail]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <h3>Data Pengguna</h3>
//       <ul>
//         {data.map((item) => (
//           <li key={item.id}>
//             BEP Harga: {item.bepHarga}, BEP Hasil: {item.bepHasil}, Laba: {item.laba}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default function Dashboard() {
//   const [username, setUsername] = useState<string>('User');
//   const [openPopup, setOpenPopup] = useState<boolean>(false);
//   const [selectedData, setSelectedData] = useState<AnalysisPeriodData | null>(null);
//   const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);

  
//   const GetDataPage = () => {
//     const [data, setData] = useState<AnalysisPeriodData[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [userEmail, setUserEmail] = useState<string | null>(null);
  
//     useEffect(() => {
//       const auth = getAuth();
//       // Memeriksa status login menggunakan onAuthStateChanged
//       const unsubscribe = onAuthStateChanged(auth, (user) => {
//         if (user) {
//           setUserEmail(user.email!); // Ambil email pengguna
//         } else {
//           console.error("Pengguna tidak login!");
//         }
//       });
//       return () => unsubscribe(); // Bersihkan listener saat komponen di-unmount
//     }, []);
  
//     useEffect(() => {
//       if (!userEmail) return;
  
//       const fetchData = async () => {
//         try {
//           console.log("Mencari dokumen dengan email:", userEmail);
  
//           // Query untuk mencari dokumen berdasarkan userId (email)
//           const detailLayerQuery = query(
//             collection(firestore, "detail_layer"),
//             where("userId", "==", userEmail)
//           );
  
//           const querySnapshot = await getDocs(detailLayerQuery);
  
//           if (!querySnapshot.empty) {
//             const userDocRef = querySnapshot.docs[0].ref; // Ambil referensi dokumen pertama
//             const subCollectionRef = collection(userDocRef, "analisis_periode");
//             const subCollectionSnapshot = await getDocs(subCollectionRef);
  
//             // Log untuk memeriksa subCollectionSnapshot
//             console.log("SubCollection Snapshot:", subCollectionSnapshot.docs);
  
//             const fetchedData: AnalysisPeriodData[] = subCollectionSnapshot.docs.map((doc) => {
//               const docData = doc.data();
//               console.log("Data Dokumen:", docData);
  
//               // Ambil data dari objek hasilAnalisis
//               const hasilAnalisis = docData.hasilAnalisis || {};
  
//               return {
//                 id: doc.id,
//                 created_at: docData.created_at || Timestamp.now(),
//                 bepHarga: hasilAnalisis.bepHarga ?? 0, // Mengakses dari objek hasilAnalisis
//                 bepHasil: hasilAnalisis.bepHasil ?? 0,
//                 laba: hasilAnalisis.laba ?? 0,
//                 marginOfSafety: hasilAnalisis.marginOfSafety ?? 0,
//                 rcRatio: hasilAnalisis.rcRatio ?? 0,
//               } as AnalysisPeriodData;
//             });
  
//             setData(fetchedData);
//             console.log("Data yang di-set:", fetchedData);
//           } else {
//             console.error("Dokumen tidak ditemukan untuk email yang diberikan!");
//           }
//         } catch (error) {
//           console.error("Error mengambil data: ", error);
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchData();
//     }, [userEmail]);
  
//     if (loading) {
//       return <p>Loading...</p>;
//     }
  
//     return (
//       <div>
//         <h3>Data Page</h3>
//         <ul>
//           {data.map((item) => (
//             <li key={item.id}>
//               {/* Tampilkan data sesuai dengan field yang ada di koleksi Firestore */}
//               BEP Harga: {item.bepHarga}, BEP Hasil: {item.bepHasil}, Laba: {item.laba}, email: {userEmail}
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUsername(user.displayName || 'User');
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const fetchDataAnalisis = async () => {
//       try {
//         const q = query(collection(firestore, 'analisis_periode')); // Sesuaikan dengan nama koleksi Anda
//         const querySnapshot = await getDocs(q);
        
//         const data: AnalysisPeriodData[] = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           created_at: doc.data().created_at,
//           bepHarga: doc.data().bepHarga,
//           bepHasil: doc.data().bepHasil,
//           laba: doc.data().laba,
//           marginOfSafety: doc.data().marginOfSafety,
//           rcRatio: doc.data().rcRatio,
//         }));

//         setDataAnalisis(data);
//       } catch (error) {
//         console.error("Error saat mengambil data analisis: ", error);
//       }
//     };

//     fetchDataAnalisis();
//   }, []);

//   const handleCardClick = (data: AnalysisPeriodData) => {
//     setSelectedData(data);
//     setOpenPopup(true);
//   };

//   return (
//     <div style={styles.pageContainer}>
//       <SidebarDemo>
//         <div style={styles.contentContainer}>
//           <h1 style={styles.title}> </h1>
//           <Grid container spacing={3}>
//             {/* Riwayat Analisis */}
//             <Grid item xs={12} md={6}>
//               <Typography variant="h5" style={styles.sectionTitle}>Riwayat Analisis</Typography>
//               <Grid container spacing={3}>
//                 {dataAnalisis.map((data, index) => (
//                   <Grid item xs={12} key={index}>
//                     <Card style={styles.card} onClick={() => handleCardClick(data)}>
//                       <CardContent>
//                         <Typography variant="h6" style={styles.time}>{data.created_at.toDate().toLocaleTimeString()}</Typography>
//                         <Typography variant="body2" style={styles.date}>{data.created_at.toDate().toLocaleDateString()}</Typography>
//                         <Typography variant="body1" style={styles.amount}>Rp. {data.bepHarga}</Typography>
//                         <Typography variant="body2" style={styles.description}>{data.marginOfSafety}</Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Grid>
//             {/* Penetasan */}
//             <Grid item xs={12} md={6}>
//               <Typography variant="h5" style={styles.sectionTitle}>Penetasan</Typography>
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Card style={styles.emptyCard}>
//                     <CardContent>
//                       <Typography variant="body2">Konten belum tersedia.</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//           <Popup 
//             open={openPopup} 
//             onClose={() => setOpenPopup(false)} 
//             data={selectedData} 
//           />
//         </div>
//       </SidebarDemo>
//     </div>
//   );
// }
