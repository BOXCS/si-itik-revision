"use client";

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