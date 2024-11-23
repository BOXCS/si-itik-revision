"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AreaChart } from "@/components/ui/chart";
// import { db } from "@/lib/firebase";
import {
  collection,
  // doc,
  getDocs,
  // getDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
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
  periode: string;
  analysisId: string;
  created_at: Timestamp;
  bepHarga: number;
  bepHasil: number;
  Laba: number;
  marginOfSafety: number;
  rcRatio: number;
  analysisName: string;
  totalRevenue: number;
  totalCost: number;
}

// type PeriodData = {
//   analysisName: string;
//   marginOfSafety: number;
//   rcRatio: number;
//   bepHarga: number;
//   bepHasil: number;
//   laba: number;
// };

type PopupProps = {
  open: boolean;
  onClose: () => void;
  data1: {
    analysisName: string;
    marginOfSafety: number;
    rcRatio: number;
    bepHarga: number;
    bepHasil: number;
    Laba: number;
    totalRevenue: number;
    totalCost: number;
    periode: string;
  } | null;
  data2: {
    analysisName: string;
    marginOfSafety: number;
    rcRatio: number;
    bepHarga: number;
    bepHasil: number;
    Laba: number;
    totalRevenue: number;
    totalCost: number;
    periode: string;
  } | null;
};

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
      boxShadow: "0px 12px 24px rgba(255, 153, 51, 0.7)", // Darker orange shadow on hover
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
  popupContainer: {
    width: "90vw", // Adjust the popup width to cover 90% of the viewport width
    maxWidth: "1000px", // Set a maximum width for larger screens
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
  },
  popupTitle: {
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  popupContent: {
    padding: "20px 0",
  },
  chartContainer: {
    marginTop: "20px",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column" as const, // Tentukan tipe flexDirection sebagai const
    gap: 8, // Tentukan gap sebagai number, bukan string
  },

  labelText: {
    fontWeight: "bold",
  },
};

export default function RiwayatAnalisis() {
  const [username, setUsername] = useState<string>("User"); //Variabel state ini menyimpan nama pengguna dengan nilai awal "User".
  const [openPopup, setOpenPopup] = useState<boolean>(false); //State boolean ini mengontrol apakah popup terbuka. Nilai awalnya adalah false.
  const [selectedData, setSelectedData] = useState<AnalysisPeriodData | null>(
    null //Variabel state ini menyimpan data analisis yang dipilih saat ini. Awalnya diatur ke null (menandakan tidak ada data yang dipilih). Tipe AnalysisPeriodData | null berarti dapat menyimpan data dari tipe AnalysisPeriodData atau null
  );
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]); //
  const [chartData, setChartData] = useState<{ Prd: number; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>("terbaru");

  console.log(chartData)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  // async function getAnalysisPeriodData(
  //   analysisId: string,
  //   periode: string
  // ): Promise<AnalysisPeriodData | null> {
  //   try {
  //     const docRef = doc(
  //       firestore,
  //       `tipe_analisis/${analysisId}/analisis_periode/${periode}`
  //     );
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       return { id: docSnap.id, ...docSnap.data() } as AnalysisPeriodData;
  //     } else {
  //       console.error("No such document!");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Error getting document:", error);
  //     return null;
  //   }
  // }

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

                const [penetasanData] =
                  await Promise.all(
                    detailQueries.map(async (q) => {
                      // Removed `index`
                      const querySnapshot = await getDocs(q);
                      if (!querySnapshot.empty) {
                        const userDocRef = querySnapshot.docs[0].ref;
                        const subCollectionRef = query(
                          collection(userDocRef, "analisis_periode"),
                          orderBy("created_at", "asc") // Mengurutkan berdasarkan created_at
                        );
                        const subCollectionSnapshot = await getDocs(
                          subCollectionRef
                        );

                        console.log(
                          `Data dalam subCollectionSnapshot (query ${index}):`,
                          subCollectionSnapshot.docs.map((doc) => doc.data())
                        );

                        return subCollectionSnapshot.docs.map((doc) => ({
                          id: doc.id,
                          analysisId: userDoc.id,
                          created_at: doc.data().created_at || Timestamp.now(),
                          bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                          bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                          laba: doc.data().hasilAnalisis?.laba || 0,
                          marginOfSafety:
                            doc.data().hasilAnalisis?.marginOfSafety || 0,
                          periode: doc.data().periode ?? 0,
                          rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                          totalCost: doc.data().hasilAnalisis?.totalCost || 0,
                          totalRevenue:
                            doc.data().hasilAnalisis?.totalRevenue || 0,
                          analysisName: analysisName,
                        }));
                      }
                      return [];
                    })
                  );

                setChartData(
                  penetasanData.map((item) => ({
                    Prd: item.periode,
                    Revenue: item.totalRevenue,
                    Cost: item.totalCost,
                    Laba: item.laba,
                  }))
                );

                subCollectionSnapshot.docs.forEach((doc) => {
                  const docData = {
                    id: doc.id,
                    analysisId: userDoc.id,
                    created_at: doc.data().created_at || Timestamp.now(),
                    bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                    bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                    Laba: doc.data().hasilAnalisis?.laba || 0,
                    marginOfSafety:
                      doc.data().hasilAnalisis?.marginOfSafety || 0,
                    periode: doc.data().periode ?? 0,
                    rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                    totalCost: doc.data().hasilAnalisis?.totalCost || 0,
                    totalRevenue: doc.data().hasilAnalisis?.totalRevenue || 0,
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

        // setDataAnalisis(userData.flat());

        // Gabungkan data berdasarkan `analysisId` alih-alih `analysisName`
        const aggregatedData: { [key: string]: AnalysisPeriodData } = {};

        userData.flat().forEach((data) => {
          const key = data.analysisId; // Gunakan `analysisId` sebagai kunci untuk penggabungan
          if (aggregatedData[key]) {
            aggregatedData[key].Laba += data.Laba;
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

    const sortedData = [...dataAnalisis]; // Use const instead of let
    if (criteria === "terbaru") {
      sortedData.sort((a, b) => b.created_at.seconds - a.created_at.seconds);
    } else if (criteria === "terlama") {
      sortedData.sort((a, b) => a.created_at.seconds - b.created_at.seconds);
    } else if (criteria === "laba") {
      sortedData.sort((a, b) => b.Laba - a.Laba);
    } else if (criteria === "tipe") {
      sortedData.sort((a, b) => a.analysisName.localeCompare(b.analysisName));
    }

    setDataAnalisis(sortedData);
  };

  return (
    <div style={styles.pageContainer}>
      <Suspense fallback={<div>Loading...</div>}>
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
              {dataAnalisis.map((data) => (
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
                        {data.Laba !== undefined &&
                        data.Laba !== null &&
                        !isNaN(data.Laba) ? (
                          <Typography
                            variant="h6"
                            style={{ ...styles.amount, textAlign: "center" }}
                          >
                            Rp. {data.Laba.toLocaleString("id-ID")}
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
              data1={selectedData}
              data2={selectedData}
            />
          </div>
        </SidebarDemo>
      </Suspense>
    </div>
  );

  function formatNumber(number: number): string {
    if (number >= 1000000) {
      const millions = number / 1000000;
      return Number.isInteger(millions)
        ? `${millions} JT`
        : `${millions.toFixed(1)} JT`;
    } else if (number >= 1000) {
      const thousands = number / 1000;
      return Number.isInteger(thousands)
        ? `${thousands} K`
        : `${thousands.toFixed(1)} K`;
    } else {
      return number.toString();
    }
  }

  function Popup({ open, onClose, data1, data2 }: PopupProps) {
    if (!data1 || !data2 ) return null;
    const chartData = [
      {
        Prd: data1.periode, // Pastikan data1.periode berisi nama atau label periode
        Revenue: data1.totalRevenue || 0,
        Cost: data1.totalCost || 0,
        Laba: data1.Laba || 0,
      },
    ];

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle style={styles.popupTitle}>
            {data1.analysisName}
          </DialogTitle>
          <DialogContent style={styles.popupContent}>
            <Grid container spacing={5} justifyContent="center">
              {[0, 1].map((index) => (
                <Grid item xs={5} key={index}>
                  <Card style={styles.card}>
                    <CardContent style={styles.cardContent}>
                      <Grid container spacing={1}>
                        {/* Baris untuk Mos */}
                        <Grid item xs={5}>
                          <Typography variant="body1" style={styles.labelText}>
                            Mos
                          </Typography>
                        </Grid>
                        <Grid item xs={1} style={{ textAlign: "center" }}>
                          <Typography variant="body1">:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            {data1.marginOfSafety}
                          </Typography>
                        </Grid>

                        {/* Baris untuk R/C Ratio */}
                        <Grid item xs={5}>
                          <Typography variant="body1" style={styles.labelText}>
                            R/C Ratio
                          </Typography>
                        </Grid>
                        <Grid item xs={1} style={{ textAlign: "center" }}>
                          <Typography variant="body1">:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            {data1.rcRatio}
                          </Typography>
                        </Grid>

                        {/* Baris untuk BEP Harga */}
                        <Grid item xs={5}>
                          <Typography variant="body1" style={styles.labelText}>
                            BEP Harga
                          </Typography>
                        </Grid>
                        <Grid item xs={1} style={{ textAlign: "center" }}>
                          <Typography variant="body1">:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            {data1.bepHarga}
                          </Typography>
                        </Grid>

                        {/* Baris untuk BEP Hasil */}
                        <Grid item xs={5}>
                          <Typography variant="body1" style={styles.labelText}>
                            BEP Hasil
                          </Typography>
                        </Grid>
                        <Grid item xs={1} style={{ textAlign: "center" }}>
                          <Typography variant="body1">:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            {data1.bepHasil}
                          </Typography>
                        </Grid>

                        {/* Baris untuk Laba */}
                        <Grid item xs={5}>
                          <Typography variant="body1" style={styles.labelText}>
                            Laba
                          </Typography>
                        </Grid>
                        <Grid item xs={1} style={{ textAlign: "center" }}>
                          <Typography variant="body1">:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Rp. {data1.Laba.toLocaleString("id-ID")}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid
              container
              justifyContent="left"
              style={{ marginTop: "20px", width: "100%" }}
            >
              <Grid item xs={10} md={8} lg={6} style={{ marginLeft: "15px" }}>
                <AreaChart
                  style={{ width: "175%" }} // Mengatur grafik agar memenuhi lebar kolom
                  className="flex items-center justify-center h-100"
                  data={chartData}
                  index="Prd"
                  categories={["Revenue", "Cost", "Laba"]}
                  valueFormatter={(number: number) => `${formatNumber(number)}`}
                  onValueChange={(v) => console.log(v)}
                  xAxisLabel="Periode"
                  yAxisLabel="Rp"
                  fill="solid"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Suspense>
    );
  }
}