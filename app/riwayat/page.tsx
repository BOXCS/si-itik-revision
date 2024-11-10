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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, ResponsiveContainer, Area } from 'recharts';
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
  totalRevenue: String;
  totalCost: String;
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

  function formatNumber(number: number): string {
    if (number >= 1000000) {
      const millions = number / 1000000;
      return Number.isInteger(millions) ? `${millions} JT` : `${millions.toFixed(1)} JT`;
    } else if (number >= 1000) {
      const thousands = number / 1000;
      return Number.isInteger(thousands) ? `${thousands} K` : `${thousands.toFixed(1)} K`;
    } else {
      return number.toString();
    }
  }

  const chartData = [
    {
      name: "0",
      'Margin of Safety': data.marginOfSafety,
      'R/C Ratio': data.rcRatio * 100, // Mengkalikan dengan 100 untuk skala yang sama
      'BEP Harga': data.bepHarga,
      'BEP Hasil': data.bepHasil,
      'Laba': data.laba,
      'totalCost': data.totalCost,
      'totalRevenue': data.totalRevenue
    }
  ];
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        style={{
          backgroundColor: '#FFD580',
          color: '#333',
          fontWeight: 'bold'
        }}
      >
        {data.analysisName}
      </DialogTitle>
      <DialogContent
        style={{
          padding: '24px',
          backgroundColor: '#FFF7E9'
        }}
      >
        <Card
          elevation={3}
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}
        >
          <Grid container spacing={2}>

            <Grid item xs={4}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>Mos</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1">{data.marginOfSafety.toFixed(2)}%</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>R/C Ratio</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1">{data.rcRatio.toFixed(2)}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>BEP Harga</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1">Rp. {data.bepHarga.toLocaleString('id-ID')}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>BEP Hasil</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1">{data.bepHasil.toLocaleString('id-ID')} unit</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>Laba</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body1">:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography variant="body1">Rp. {data.laba.toLocaleString('id-ID')}</Typography>
            </Grid>
          </Grid>
        </Card>
        

        {/* Grafik */}
        <Card
          elevation={3}
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          

          <LineChart  
            width={600}
            height={300}
            data={chartData} // Ensure chartData contains a "Periode" field and other data fields
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Periode" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 'auto']} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => value.toLocaleString('id-ID')} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />

            <Line
              type="monotone"
              dataKey="totalCost"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#8884d8', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#82ca9d', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="BEP Harga"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#ffc658', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="BEP Hasil"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#ff7300', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Laba"
              stroke="#ff0000"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#ff0000', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Margin of Safety"
              stroke="#00bcd4"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#00bcd4', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="R/C Ratio"
              stroke="#795548"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#795548', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </Card>

      </DialogContent>
      <DialogActions style={{ padding: '16px', backgroundColor: '#FFF7E9' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#FFD580',
            color: '#333',
            '&:hover': {
              backgroundColor: '#FFCC80'
            }
          }}
        >
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
