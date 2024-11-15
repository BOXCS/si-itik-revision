"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart } from "@/components/ui/chart";
import { Tooltip } from "@/components/ui/tooltip";
import UserAvatar from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Grid,
  Card,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Select,
  MenuItem,
} from "@mui/material";
import Image from "next/image";

// interface AnalisisPeriode {
//   id: string;
//   periode: string;
//   created_at: Timestamp;
//   laba: number;
//   revenue: number;
//   cost: number;
//   analysisName: string;
// }

interface AnalysisPeriodData {
  id: string;
  created_at: Timestamp;
  bepHarga: number;
  bepHasil: number;
  laba: number;
  revenue: number;
  cost: number;
  marginOfSafety: number;
  rcRatio: number;
  analysisName: string;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  // const [data, setData] = useState<AnalysisPeriodData[]>([]);
  // const [analysisHistory, setAnalysisHistory] = useState<{ id: string; time: string; type: string }[]>([]);
  const username = searchParams?.get("username") || "User";
  // const [loading, setLoading] = useState(true);
  const [chartDataPenetasan, setChartDataPenetasan] = useState<
    { Prd: string; Revenue: number; Cost: number; Laba: number }[]
  >([]);
  const [chartDataPenggemukan, setChartDataPenggemukan] = useState<
    { Prd: string; Revenue: number; Cost: number; Laba: number }[]
  >([]);
  const [chartDataLayer, setChartDataLayer] = useState<
    { Prd: string; Revenue: number; Cost: number; Laba: number }[]
  >([]);
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);
  const [originalData, setOriginalData] = useState<AnalysisPeriodData[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>("terbaru");

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
    sortControl: {
      minWidth: "150px",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      padding: "15px",
      cursor: "pointer",
      transition: "transform 0.2s",
      width: "200px", // Atur lebar card
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

  // Memeriksa login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        console.error("Pengguna tidak login");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(userEmail); // Or any other usage of periode
  }, [userEmail]); // If you want to react to changes in 'periode'

  useEffect(() => {
    const fetchUserSpecificData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("Pengguna tidak terautentikasi!");
        return;
      }

      // Set the user photo if available
      if (user.photoURL) {
        setUserPhoto(user.photoURL);
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
              // chart
              const [penetasanData, penggemukanData, layerData] =
                await Promise.all(
                  detailQueries.map(async (q, index) => {
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

                      return subCollectionSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        created_at: doc.data().created_at || Timestamp.now(),
                        bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                        bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                        laba: doc.data().hasilAnalisis?.laba || 0,
                        periode: doc.data().periode ?? 0,
                        revenue: doc.data().penerimaan?.totalRevenue || 0,
                        cost: doc.data().pengeluaran?.totalCost || 0,
                        marginOfSafety:
                          doc.data().hasilAnalisis?.marginOfSafety || 0,
                        rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                        analysisName: analysisNames[index],
                      }));
                    }
                    return [];
                  })
                );

              setChartDataPenetasan(
                penetasanData.map((item) => ({
                  Prd: item.periode,
                  Revenue: item.revenue,
                  Cost: item.cost,
                  Laba: item.laba,
                }))
              );

              setChartDataPenggemukan(
                penggemukanData.map((item) => ({
                  Prd: item.periode,
                  Revenue: item.revenue,
                  Cost: item.cost,
                  Laba: item.laba,
                }))
              );

              setChartDataLayer(
                layerData.map((item) => ({
                  Prd: item.periode,
                  Revenue: item.revenue,
                  Cost: item.cost,
                  Laba: item.laba,
                }))
              );

              const analysisName = analysisNames[index];

              return subCollectionSnapshot.docs.map((doc) => ({
                id: doc.id,
                created_at: doc.data().created_at || Timestamp.now(),
                bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                laba: doc.data().hasilAnalisis?.laba || 0,
                periode: doc.data().periode ?? 0,
                revenue: doc.data().penerimaan?.totalRevenue || 0,
                cost: doc.data().pengeluaran?.totalCost || 0,
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
        setOriginalData(Object.values(aggregatedData)); // Simpan data asli
      } catch (error) {
        console.error("Error mengambil data: ", error);
      }
    };

    fetchUserSpecificData();
  }, []);

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const criteria = event.target.value;
    setSortCriteria(criteria);

    // Mulai dari data asli untuk menghindari penyaringan berulang-ulang yang menghilangkan data
    let sortedData = [...originalData];

    if (criteria === "terbaru") {
      sortedData.sort((a, b) => b.created_at.seconds - a.created_at.seconds);
    } else if (criteria === "terlama") {
      sortedData.sort((a, b) => a.created_at.seconds - b.created_at.seconds);
    } else if (criteria === "detail_penetasan") {
      sortedData = sortedData.filter(
        (data) => data.analysisName === "Detail Penetasan"
      );
    } else if (criteria === "detail_penggemukan") {
      sortedData = sortedData.filter(
        (data) => data.analysisName === "Detail Penggemukan"
      );
    } else if (criteria === "detail_layer") {
      sortedData = sortedData.filter(
        (data) => data.analysisName === "Detail Layer"
      );
    }

    setDataAnalisis(sortedData);
  };

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarDemo>
        <div className="flex-1 items-center justify-center">
          {/* Title Menu */}
          <div className="flex flex-wrap justify-between p-5 pt-5 pb-0">
            <h1 className="text-1xl font-bold">Beranda </h1>
            <Tooltip side="bottom" showArrow={false} content={username}>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full">
                    <UserAvatar photoURL={userPhoto} />{" "}
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>

          <div className="flex flex-cols grid-rows-2 pb-0">
            {/* Main */}
            <div className="flex-1 flex-wrap 4grid-cols items-center justify-center p-5 pb-0">
              {/* Card Tab */}
              <div className="flex-1 bg-white to-orange-100 rounded-lg shadow-md height-1/2 p-8">
                <div className="flex-1">
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">Penetasan</TabsTrigger>
                      <TabsTrigger value="tab2">Penggemukan</TabsTrigger>
                      <TabsTrigger value="tab3">Layering</TabsTrigger>
                    </TabsList>
                    <div className="ml-2 mt-4">
                      <TabsContent
                        value="tab1"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <Image
                            src="/assets/DB_penggemukan.webp"
                            alt="DB_penggemukan"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-auto" // Kelas Tailwind untuk kontrol tambahan
                          />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk
                            mengoptimalkan proses penetasan telur itik,
                            memastikan kesuksesan menetas maksimal dan kualitas
                            anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="tab2"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <Image
                            src="/assets/DB_penggemukan.webp"
                            alt="DB_penggemukan"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-auto" // Kelas Tailwind untuk kontrol tambahan
                          />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk
                            mengoptimalkan proses penetasan telur itik,
                            memastikan kesuksesan menetas maksimal dan kualitas
                            anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="tab3"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <Image
                            src="/assets/DB_layer.webp"
                            alt="DB_layeri"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-auto" // Kelas Tailwind untuk kontrol tambahan
                          />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk
                            mengoptimalkan proses penetasan telur itik,
                            memastikan kesuksesan menetas maksimal dan kualitas
                            anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              <div className="flex justify-center gap-5 pt-5">
                <div className="flex-1 bg-white p-3 rounded-lg shadow-md">
                  <div className="flex-1">
                    <Tabs defaultValue="tab1">
                      <TabsList>
                        <TabsTrigger value="tab1">Penetasan</TabsTrigger>
                        <TabsTrigger value="tab2">Penggemukan</TabsTrigger>
                        <TabsTrigger value="tab3">Layering</TabsTrigger>
                      </TabsList>
                      <div className="ml-2 mt-4">
                        <TabsContent
                          value="tab1"
                          className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                          <div className="flex space-x-4">
                            <AreaChart
                              className=" flex items-center justify-center h-50"
                              data={chartDataPenetasan}
                              index="Prd"
                              categories={["Revenue", "Cost", "Laba"]}
                              valueFormatter={(number: number) =>
                                `${formatNumber(number)}`
                              }
                              onValueChange={(v) => console.log(v)}
                              xAxisLabel="Periode"
                              yAxisLabel="Rp"
                              fill="solid"
                            />
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="tab2"
                          className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                          <div className="flex space-x-4">
                            <AreaChart
                              className=" flex items-center justify-center h-50"
                              data={chartDataPenggemukan}
                              index="Prd"
                              categories={["Revenue", "Cost", "Laba"]}
                              valueFormatter={(number: number) =>
                                `${formatNumber(number)}`
                              }
                              onValueChange={(v) => console.log(v)}
                              xAxisLabel="Periode"
                              yAxisLabel="Rp"
                              fill="solid"
                            />
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="tab3"
                          className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                          <div className="flex space-x-4">
                            <AreaChart
                              className=" flex items-center justify-center h-50"
                              data={chartDataLayer}
                              index="Prd"
                              categories={["Revenue", "Cost", "Laba"]}
                              valueFormatter={(number: number) =>
                                `${formatNumber(number)}`
                              }
                              onValueChange={(v) => console.log(v)}
                              xAxisLabel="Periode"
                              yAxisLabel="Rp"
                              fill="solid"
                            />
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat */}
            <div className="flex justify-center p-5 gap-5 pl-0">
              <div className="bg-white p-3 rounded-lg shadow-md w-200">
                <div className="flex flex-wrap items-center justify-between">
                  <h2 className="text-lg sm-bold">Riwayat Analisis</h2>
                  <div>
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
                        <MenuItem value="detail_penetasan">
                          Detail Penetasan
                        </MenuItem>
                        <MenuItem value="detail_penggemukan">
                          Detail Penggemukan
                        </MenuItem>
                        <MenuItem value="detail_layer">Detail Layer</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                {/*Card Riwayat Analisis */}
                <Grid container spacing={3}>
                  {dataAnalisis.map((data, index) => (
                    <Grid item xs={12} key={index}>
                      <Card
                        style={{
                          ...styles.card,
                          flexDirection: "column",
                          width: "100%",
                          height: "138px",
                        }}
                      >
                        {/* Display Analysis Name */}
                        <Typography
                          variant="body1"
                          style={{
                            borderRadius: "9999px",
                            textAlign: "center",
                            display: "inline-block",
                            marginTop: "0px",
                            fontWeight: "bold",
                          }}
                        >
                          {data.analysisName} {/* Menampilkan nama analisis */}
                        </Typography>

                        {/* Garis pemisah */}
                        <Divider style={{ margin: "10px 0" }} />

                        {/* Tombol Lihat Detail */}
                        <Grid container justifyContent="space-between">
                          <Typography variant="body1">Gambar</Typography>
                          <Typography
                            variant="body1"
                            style={{
                              backgroundColor: "#FFD580",
                              padding: "5px 10px",
                              borderRadius: "9999px",
                              textAlign: "center",
                              display: "inline-block",
                              marginTop: "2px",
                              fontWeight: "bold",
                            }}
                          >
                            Lihat Detail
                          </Typography>
                        </Grid>

                        {/* Garis pemisah */}
                        <Divider style={{ margin: "10px 0" }} />

                        {/* Display Time and Date */}
                        <Grid container justifyContent="space-between">
                          <Typography variant="body2" style={styles.time}>
                            {data.created_at.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </Typography>
                          <Typography variant="body2" style={styles.date}>
                            {data.created_at.toDate().toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-sm flex-center">@si-itik.polije</h1>
          </div>
        </div>
      </SidebarDemo>
      </Suspense>
  );
}
