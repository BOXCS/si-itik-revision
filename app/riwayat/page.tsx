"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface AnalysisPeriodData {
  id: string;
  analysisId: string;
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
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
  },
  sortControl: {
    minWidth: "150px",
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
  const [sortCriteria, setSortCriteria] = useState<string>("terbaru");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

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
        console.log("Email pengguna:", userEmail);

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
            console.log(`Snapshot untuk query ${index}:`, querySnapshot);

            if (!querySnapshot.empty) {
              const subCollectionData: AnalysisPeriodData[] = [];
              for (const userDoc of querySnapshot.docs) {
                const userDocRef = userDoc.ref;
                const subCollectionRef = collection(
                  userDocRef,
                  "analisis_periode"
                );
                const subCollectionSnapshot = await getDocs(subCollectionRef);

                console.log(
                  `Subcollection snapshot untuk ${index}:`,
                  subCollectionSnapshot
                );

                const analysisNames = [
                  "Detail Penetasan",
                  "Detail Penggemukan",
                  "Detail Layer",
                ];
                const analysisName = analysisNames[index];

                subCollectionSnapshot.docs.forEach((doc) => {
                  const docData = {
                    id: doc.id,
                    analysisId: userDoc.id,
                    created_at: doc.data().created_at || Timestamp.now(),
                    bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                    bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                    laba: doc.data().hasilAnalisis?.laba || 0,
                    marginOfSafety:
                      doc.data().hasilAnalisis?.marginOfSafety || 0,
                    rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                    analysisName: analysisName,
                  };
                  subCollectionData.push(docData);
                });
              }
              return subCollectionData;
            }
            return [];
          })
        );

        // Gabungkan data berdasarkan `analysisId` alih-alih `analysisName`
        const aggregatedData: { [key: string]: AnalysisPeriodData } = {};

        userData.flat().forEach((data) => {
          const key = data.analysisId; // Gunakan `analysisId` sebagai kunci untuk penggabungan
          if (aggregatedData[key]) {
            aggregatedData[key].laba += data.laba;
            aggregatedData[key].bepHarga += data.bepHarga;
            aggregatedData[key].bepHasil += data.bepHasil;
            if (data.created_at < aggregatedData[key].created_at) {
              aggregatedData[key].created_at = data.created_at;
            }
          } else {
            aggregatedData[key] = { ...data };
          }
        });

        console.log("Data yang sudah digabungkan:", aggregatedData);

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

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const criteria = event.target.value;
    setSortCriteria(criteria);

    let sortedData = [...dataAnalisis];
    if (criteria === "terbaru") {
      sortedData.sort((a, b) => b.created_at.seconds - a.created_at.seconds);
    } else if (criteria === "terlama") {
      sortedData.sort((a, b) => a.created_at.seconds - b.created_at.seconds);
    } else if (criteria === "laba") {
      sortedData.sort((a, b) => b.laba - a.laba);
    } else if (criteria === "tipe") {
      sortedData.sort((a, b) => a.analysisName.localeCompare(b.analysisName));
    }

    setDataAnalisis(sortedData);
  };

  return (
    <div style={styles.pageContainer}>
      <SidebarDemo>
        <div style={styles.contentContainer}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>Halo, {username}</h1>
            <FormControl variant="outlined" style={styles.sortControl}>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortCriteria}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="terbaru">Terbaru</MenuItem>
                <MenuItem value="terlama">Terlama</MenuItem>
                <MenuItem value="laba">Laba Terbanyak</MenuItem>
                <MenuItem value="tipe">Tipe Analisis</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Grid container spacing={3}>
            {dataAnalisis.map((data, index) => (
              <Grid item xs={12} sm={6} md={4} key={data.id}>
                <Card
                  style={{
                    ...styles.card,
                    width: "300px", // Ukuran lebar tetap untuk desktop
                    height: "200px", // Ukuran tinggi tetap untuk desktop
                  }}
                  onClick={() => handleCardClick(data)}
                >
                  <CardContent
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "180px",
                    }}
                  >
                    <Grid container justifyContent="space-between">
                      <Typography variant="body2" style={styles.time}>
                        {data.created_at.toDate().toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" style={styles.date}>
                        {data.created_at.toDate().toLocaleDateString()}
                      </Typography>
                    </Grid>

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
                      {data.analysisName}
                    </Typography>

                    {/* <Typography variant="body2" style={styles.description}>
                      ID Analisis: {data.analysisId}
                    </Typography> */}
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
