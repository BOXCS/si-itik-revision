"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firestore, auth } from "@/lib/firebase";
import { SidebarDemo } from "@/components/Sidebar";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface AnalysisPeriodData {
  id: string;
  created_at: Timestamp;
  bepHarga: number;
  bepHasil: number;
  laba: number;
  marginOfSafety: number;
  rcRatio: number;
  analysisName: string;
}

interface PopupProps {
  open: boolean;
  onClose: () => void;
  data: AnalysisPeriodData | null;
}

const styles = {
  pageContainer: {
    background: "linear-gradient(180deg, #FFD580, #FFCC80)",
    minHeight: "100vh",
    padding: "0px",
    margin: "0px",
    fontFamily: "'Arial', sans-serif",
  },
  contentContainer: {
    padding: "20px",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  sectionTitle: {
    color: "#333",
    marginBottom: "15px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "15px",
    cursor: "pointer",
    transition: "transform 0.2s",
    width: "300px", // Atur lebar card
    height: "200px", // Atur tinggi card
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  time: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  date: {
    fontSize: "14px",
    color: "#777",
  },
  amount: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#000",
  },
  description: {
    fontSize: "14px",
    color: "#999",
  },
  popupTitle: {
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  popupContent: {
    padding: "20px 0",
  },
};

function Popup({ open, onClose, data }: PopupProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={styles.popupTitle}>Detail Analisis</DialogTitle>
      <DialogContent style={styles.popupContent}>
        <Typography variant="h6" style={styles.time}>
          {data.created_at.toDate().toLocaleTimeString()}
        </Typography>
        <Typography variant="body2" style={styles.date}>
          {data.created_at.toDate().toLocaleDateString()}
        </Typography>
        <Typography variant="body1" style={styles.amount}>
          Rp. {data.bepHarga}
        </Typography>
        <Typography variant="body2" style={styles.description}>
          {data.marginOfSafety}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RiwayatAnalisis() {
  const [username, setUsername] = useState<string>("User");
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<AnalysisPeriodData | null>(
    null
  );
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch User-Specific Data
  // Fetch User-Specific Data
  useEffect(() => {
    const fetchUserSpecificData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("Pengguna tidak terautentikasi!");
        return;
      }

      try {
        const userEmail = user.email;
        const detailQueries = [
          query(
            collection(firestore, "detail_penetasan"),
            where("userId", "==", userEmail)
          ),
          query(
            collection(firestore, "detail_penggemukan"),
            where("userId", "==", userEmail)
          ),
          query(
            collection(firestore, "detail_layer"),
            where("userId", "==", userEmail)
          ),
        ];

        const userData = await Promise.all(
          detailQueries.map(async (q, index) => {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const userDocRef = querySnapshot.docs[0].ref;
              const subCollectionRef = collection(
                userDocRef,
                "analisis_periode"
              );
              const subCollectionSnapshot = await getDocs(subCollectionRef);

              // Tentukan nama analisis berdasarkan index
              const analysisNames = [
                "Detail Penetasan",
                "Detail Penggemukan",
                "Detail Layer",
              ];
              const analysisName = analysisNames[index];

              return subCollectionSnapshot.docs.map((doc) => ({
                id: doc.id,
                created_at: doc.data().created_at || Timestamp.now(),
                bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                laba: doc.data().hasilAnalisis?.laba || 0,
                marginOfSafety: doc.data().hasilAnalisis?.marginOfSafety || 0,
                rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                analysisName: analysisName, // Menyimpan nama analisis
              }));
            }
            return [];
          })
        );

        // Menggabungkan data berdasarkan analysisName
        const aggregatedData: { [key: string]: AnalysisPeriodData } = {};

        userData.flat().forEach((data) => {
          const key = data.analysisName; // Gunakan analysisName sebagai kunci untuk pengelompokan
          if (aggregatedData[key]) {
            // Jika kunci sudah ada, tambahkan laba dan lainnya
            aggregatedData[key].laba += data.laba;
            aggregatedData[key].bepHarga += data.bepHarga; // Jika ingin menjumlahkan ini juga
            aggregatedData[key].bepHasil += data.bepHasil; // Demikian juga untuk ini
            // Pertahankan created_at yang paling awal
            if (data.created_at < aggregatedData[key].created_at) {
              aggregatedData[key].created_at = data.created_at;
            }
          } else {
            // Jika kunci belum ada, buat entri baru
            aggregatedData[key] = { ...data };
          }
        });

        // Convert the aggregated data back to an array and update state
        setDataAnalisis(Object.values(aggregatedData));
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
            {dataAnalisis.map((data, index) => (
              <Grid item xs={12} key={index}>
                <Card style={styles.card} onClick={() => handleCardClick(data)}>
                <CardContent
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "180px",
                    }}
                  >
                    {/* Display Time and Date */}
                    <Grid container justifyContent="space-between">
                      <Typography variant="body2" style={styles.time}>
                        {data.created_at.toDate().toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" style={styles.date}>
                        {data.created_at.toDate().toLocaleDateString()}
                      </Typography>
                    </Grid>

                    {/* Display Profit */}
                    {/* <Typography variant="h6" style={styles.amount}>
                      Rp. {data.laba.toLocaleString("id-ID")}
                    </Typography> */}

                    <div
                      style={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {data.laba !== undefined &&
                      data.laba !== null &&
                      !isNaN(data.laba) ? (
                        <Typography
                          variant="h6"
                          style={{ ...styles.amount, textAlign: "center" }}
                        >
                          Rp. {data.laba.toLocaleString("id-ID")}
                        </Typography>
                      ) : (
                        <Typography
                          variant="h6"
                          style={{
                            ...styles.amount,
                            textAlign: "center",
                            color: "red",
                          }}
                        >
                          Laba tidak tersedia
                        </Typography>
                      )}
                    </div>

                    {/* Display Analysis Name */}
                    <Typography
                      variant="body1"
                      style={{
                        backgroundColor: "#FFD580",
                        padding: "5px 10px",
                        borderRadius: "9999px",
                        textAlign: "center",
                        display: "inline-block",
                        marginTop: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {data.analysisName} {/* Menampilkan nama analisis */}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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
