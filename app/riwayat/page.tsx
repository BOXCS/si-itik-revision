"use client";

// import React, { useState } from 'react';

// interface AnalysisData {
//   waktu: string;
//   tanggal: string;
//   jumlah: string;
//   deskripsi: string;
// }

// interface PopupProps {
//   open: boolean;
//   onClose: () => void;
//   data: AnalysisData | null;
// }

// function AnalysisPopup({ open, onClose, data }: PopupProps) {
//   if (!open || !data) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Detail Analisis</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           <div>
//             <h3 className="text-lg font-semibold">{data.waktu}</h3>
//             <p className="text-sm text-gray-500">{data.tanggal}</p>
//           </div>
//           <div>
//             <p className="text-xl font-bold">{data.jumlah}</p>
//             <p className="text-sm text-gray-500">{data.deskripsi}</p>
//           </div>
//         </div>
        
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Tutup
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   const [openPopup, setOpenPopup] = useState<boolean>(false);
//   const [selectedData, setSelectedData] = useState<AnalysisData | null>(null);
//   const [analysisData, setAnalysisData] = useState<AnalysisData[]>([
//     { waktu: '15:45', tanggal: '01/10/2024', jumlah: 'Rp. 200.000', deskripsi: 'periode 1' },
//     { waktu: '15:45', tanggal: '01/10/2024', jumlah: 'Rp. 200.000', deskripsi: 'periode 2' },
//     { waktu: '15:45', tanggal: '03/11/2024', jumlah: 'Rp. 200.000', deskripsi: 'Detail Penetasan' },
//   ]);

//   const handleCardClick = (data: AnalysisData) => {
//     setSelectedData(data);
//     setOpenPopup(true);
//   };

//   const addNewAnalysis = (newData: AnalysisData) => {
//     setAnalysisData(prevData => [...prevData, newData]);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-orange-200 to-orange-300 p-6">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Beranda</h1>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Riwayat Analisis */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Analisis</h2>
//             <div className="space-y-4">
//               {analysisData.map((data, index) => (
//                 <div 
//                   key={index}
//                   className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
//                   onClick={() => handleCardClick(data)}
//                 >
//                   <div className="space-y-2">
//                     <h3 className="text-lg font-semibold">{data.waktu}</h3>
//                     <p className="text-sm text-gray-500">{data.tanggal}</p>
//                     <p className="text-xl font-bold">{data.jumlah}</p>
//                     <p className="text-sm text-gray-500">{data.deskripsi}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Penetasan */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Penetasan</h2>
//             <div className="bg-white rounded-lg p-4 shadow-md">
//               <div className="flex items-center justify-center min-h-[100px]">
//                 <p className="text-gray-500">Konten belum tersedia.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <AnalysisPopup 
//           open={openPopup}
//           onClose={() => setOpenPopup(false)}
//           data={selectedData}
//         />
//       </div>
//     </div>
//   );
// }
// "use client";

import React, { useState, useEffect } from 'react';
import { SidebarDemo } from '@/components/Sidebar';
import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AnalysisData {
  waktu: string;
  tanggal: string;
  jumlah: string;
  deskripsi: string;
}

interface PopupProps {
  open: boolean;
  onClose: () => void;
  data: AnalysisData | null;
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
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
        <Typography variant="h6" style={styles.time}>{data.waktu}</Typography>
        <Typography variant="body2" style={styles.date}>{data.tanggal}</Typography>
        <Typography variant="body1" style={styles.amount}>{data.jumlah}</Typography>
        <Typography variant="body2" style={styles.description}>{data.deskripsi}</Typography>
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
  const [selectedData, setSelectedData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || 'User');
      }
    });

    return () => unsubscribe();
  }, []);

  const analysisData: AnalysisData[] = [
    { waktu: '15:45', tanggal: '01/10/2024', jumlah: 'Rp. 200.000', deskripsi: 'periode 1' },
    { waktu: '15:45', tanggal: '01/10/2024', jumlah: 'Rp. 200.000', deskripsi: 'periode 2' },
    { waktu: '15:45', tanggal: '03/11/2024', jumlah: 'Rp. 200.000', deskripsi: 'Detail Penetasan' },
  ];

  const handleCardClick = (data: AnalysisData) => {
    setSelectedData(data);
    setOpenPopup(true);
  };

  return (
    <div style={styles.pageContainer}>
      <SidebarDemo>
        <div style={styles.contentContainer}>
          <h1 style={styles.title}>Beranda. Halo {username}</h1>
          <Grid container spacing={3}>
            {/* Riwayat Analisis */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" style={styles.sectionTitle}>Riwayat Analisis</Typography>
              <Grid container spacing={3}>
                {analysisData.map((data, index) => (
                  <Grid item xs={12} key={index}>
                    <Card style={styles.card} onClick={() => handleCardClick(data)}>
                      <CardContent>
                        <Typography variant="h6" style={styles.time}>{data.waktu}</Typography>
                        <Typography variant="body2" style={styles.date}>{data.tanggal}</Typography>
                        <Typography variant="body1" style={styles.amount}>{data.jumlah}</Typography>
                        <Typography variant="body2" style={styles.description}>{data.deskripsi}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            {/* Penetasan */}
            <Grid item xs={12} md={6}>
              <Typography variant="h5" style={styles.sectionTitle}>Penetasan</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card style={styles.emptyCard}>
                    <CardContent>
                      <Typography variant="body2">Konten belum tersedia.</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Popup 
            open={openPopup} 
            onClose={() => setOpenPopup(false)} 
            data={selectedData} 
          />
        </div>
      </SidebarDemo>
    </div>
  );
}