"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart } from "@/components/ui/chart"
import { Tooltip } from "@/components/ui/tooltip";
import UserAvatar from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
import { auth } from "@/lib/firebase";
import { unsubscribe } from "diagnostics_channel";

interface AnalisisPeriode {
  id: string;
  periode: string;
  created_at: Timestamp;
  laba: number;
  revenue: number;
  cost: number;
  analysisName: string;
}

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
  const [data, setData] = useState<AnalysisPeriodData[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<{ id: string; time: string; type: string }[]>([]);
  const username = searchParams?.get("username") || "User";
  const [loading, setLoading] = useState(true);
  const [chartDataPenetasan, setChartDataPenetasan] = useState<{ Prd: string; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [chartDataPenggemukan, setChartDataPenggemukan] = useState<{ Prd: string; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [chartDataLayer, setChartDataLayer] = useState<{ Prd: string; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);

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
        console.error("Pengguna tidak login")
      }
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (!userEmail) return;
  //   const fetchData = async () => {
  //     try {
  //       console.log("Mencari dokumen dengan email:", userEmail);
  //       //Detail Penetasan
  //       const detailpenetasan = query(
  //         collection(firestore, "detail_penetasan"),
  //         where("userId", "==", userEmail)
  //       );

  //       const querySnapshot = await getDocs(detailpenetasan);

  //       if (!querySnapshot.empty) {
  //         const userDocref = querySnapshot.docs[0].ref;
  //         const subCollectionRef = query(
  //           collection(userDocref, "analisis_periode"),
  //           orderBy("created_at", "asc") // Mengurutkan berdasarkan `created_at`
  //         );
  //         const subCollectionSnapshot = await getDocs(subCollectionRef);

  //         console.log("SubCollection Snapshot: ", subCollectionSnapshot.docs);

  //         const fetchData: AnalisisPeriode[] = subCollectionSnapshot.docs.map((doc) => {
  //           const docData = doc.data();
  //           console.log("Data Dokumen: ", docData);

  //           const hasilAnalisis = docData.hasilAnalisis || {};
  //           const penerimaan = docData.penerimaan || {};
  //           const pengeluaran = docData.pengeluaran || {};
  //           const periode = docData.periode || {};

  //           return {
  //             id: doc.id,
  //             created_at: docData.created_at || Timestamp.now(),
  //             laba: hasilAnalisis.laba ?? 0,
  //             revenue: penerimaan.totalRevenue ?? 0,
  //             cost: pengeluaran.totalCost ?? 0,
  //             periode: periode ??0,
  //           } as AnalisisPeriode;
  //         });

  //         setData(fetchData);
  //         console.log("Data yang di set: ", fetchData);          
  //         const updatedChartData = fetchData.map(item => ({
  //           Prd: item.periode,
  //           Revenue: item.revenue,
  //           Cost: item.cost,
  //           Laba: item.laba,
  //         }));
  //         setChartDataPenetasan(updatedChartData);
  //       } else {
  //         console.error("Dokumen tidak ditemukan untuk email yang diberikan");
  //       }

  //       //Detail Penggemukan
  //       const detailpenggemukan = query(
  //         collection(firestore, "detail_penggemukan"),
  //         where("userId", "==", userEmail)
  //       );

  //       const querySnapshot1 = await getDocs(detailpenggemukan);

  //       if (!querySnapshot1.empty) {
  //         const userDocref = querySnapshot1.docs[0].ref;
  //         const subCollectionRef = query(
  //           collection(userDocref, "analisis_periode"),
  //           orderBy("created_at", "asc") // Mengurutkan berdasarkan `created_at`
  //         );
  //         const subCollectionSnapshot = await getDocs(subCollectionRef);

  //         console.log("SubCollection Snapshot:                                                                                    ", subCollectionSnapshot.docs);

  //         const fetchData: AnalisisPeriode[] = subCollectionSnapshot.docs.map((doc) => {
  //           const docData = doc.data();
  //           console.log("Data Dokumen: ", docData);

  //           const hasilAnalisis = docData.hasilAnalisis || {};
  //           const penerimaan = docData.penerimaan || {};
  //           const pengeluaran = docData.pengeluaran || {};
  //           const periode = docData.periode || {};

  //           return {
  //             id: doc.id,
  //             created_at: docData.created_at || Timestamp.now(),
  //             laba: hasilAnalisis.laba ?? 0,
  //             revenue: penerimaan.totalRevenue ?? 0,
  //             cost: pengeluaran.totalCost ?? 0,
  //             periode: periode ??0,
  //           } as AnalisisPeriode;
  //         });

  //         setData(fetchData);
  //         console.log("Data yang di set: ", fetchData);          
  //         const updatedChartData = fetchData.map(item => ({
  //           Prd: item.periode,
  //           Revenue: item.revenue,
  //           Cost: item.cost,
  //           Laba: item.laba,
  //         }));
  //         setChartDataPenggemukan(updatedChartData);
  //       } else {
  //         console.error("Dokumen tidak ditemukan untuk email yang diberikan");
  //       }

  //       //Detail Layering
  //       const detaillayer = query(
  //         collection(firestore, "detail_layer"),
  //         where("userId", "==", userEmail)
  //       );

  //       const querySnapshot2 = await getDocs(detaillayer);

  //       if (!querySnapshot2.empty) {
  //         const userDocref = querySnapshot2.docs[0].ref;
  //         const subCollectionRef = query(
  //           collection(userDocref, "analisis_periode"),
  //           orderBy("created_at", "asc") // Mengurutkan berdasarkan `created_at`
  //         );
  //         const subCollectionSnapshot = await getDocs(subCollectionRef);

  //         console.log("SubCollection Snapshot: ", subCollectionSnapshot.docs);

  //         const fetchData: AnalisisPeriode[] = subCollectionSnapshot.docs.map((doc) => {
  //           const docData = doc.data();
  //           console.log("Data Dokumen: ", docData);

  //           const hasilAnalisis = docData.hasilAnalisis || {};
  //           const penerimaan = docData.penerimaan || {};
  //           const pengeluaran = docData.pengeluaran || {};
  //           const periode = docData.periode || {};

  //           return {
  //             id: doc.id,
  //             created_at: docData.created_at || Timestamp.now(),
  //             laba: hasilAnalisis.laba ?? 0,
  //             revenue: penerimaan.totalRevenue ?? 0,
  //             cost: pengeluaran.totalCost ?? 0,
  //             periode: periode ??0,
  //           } as AnalisisPeriode;
  //         });

  //         setData(fetchData);
  //         console.log("Data yang di set: ", fetchData);          
  //         const updatedChartData = fetchData.map(item => ({
  //           Prd: item.periode,
  //           Revenue: item.revenue,
  //           Cost: item.cost,
  //           Laba: item.laba,
  //         }));
  //         setChartDataLayer(updatedChartData);
  //       } else {
  //         console.error("Dokumen tidak ditemukan untuk email yang diberikan");
  //       }


  //     } catch (error) {
  //       console.error("Error mengambil Data: ", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [userEmail]);
  // if (loading) {
  //   return <p>Loading...</p>
  // }

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
              const subCollectionSnapshot1 = await getDocs(subCollectionRef);


              // Tentukan nama analisis berdasarkan index
              const analysisNames = [
                "Detail Penetasan",
                "Detail Penggemukan",
                "Detail Layer",
              ];

              const [penetasanData, penggemukanData, layerData] = await Promise.all(
                detailQueries.map(async (q, index) => {
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                    const userDocRef = querySnapshot.docs[0].ref;
                    const subCollectionRef = query(
                                collection(userDocRef, "analisis_periode"),
                                orderBy("created_at", "asc") // Mengurutkan berdasarkan `created_at`
                              );
                    const subCollectionSnapshot = await getDocs(subCollectionRef);

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
                      analysisName: analysisNames[index],
                    }));
                  }
                  return [];
                })
              );

            return subCollectionSnapshot.docs.map((doc) => ({
              id: doc.id,
              created_at: doc.data().created_at || Timestamp.now(),
              bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
              bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
              laba: doc.data().hasilAnalisis?.laba || 0,
              periode: doc.data().periode ??0,
            revenue: doc.data().penerimaan?.totalRevenue || 0,
            cost: doc.data().pengeluaran?.totalCost || 0,
              marginOfSafety: doc.data().hasilAnalisis?.marginOfSafety || 0,
              rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
              analysisName: analysisNames[index],
            }));
          }
          return [];
        })
      );

              setChartDataPenetasan(penetasanData.map(item => ({
                Prd: item.periode,
                Revenue: item.revenue,
                Cost: item.cost,
                Laba: item.laba,
              })));

              setChartDataPenggemukan(penggemukanData.map(item => ({
                Prd: item.periode,
                Revenue: item.revenue,
                Cost: item.cost,
                Laba: item.laba,
              })));

              setChartDataLayer(layerData.map(item => ({
                Prd: item.periode,
                Revenue: item.revenue,
                Cost: item.cost,
                Laba: item.laba,
              })));

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
                periode: doc.data().periode ??0,
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
      } catch (error) {
        console.error("Error mengambil data: ", error);
      }
    };

    fetchUserSpecificData();
  }, []);


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

  return (
    <div>
      <SidebarDemo>
        <div className="flex-1 items-center justify-center">
          {/* Title Menu */}
          <div className="flex flex-wrap justify-between p-5 pt-5 pb-0">
            <h1 className="text-1xl font-bold">Beranda </h1>
            <Tooltip
              side="bottom"
              showArrow={false}
              content={username}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full"><UserAvatar photoURL={userPhoto} /> </div>

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
                          <img src="/assets/DB_penggemukan.webp"
                            alt="DB_penggemukan"
                            style={{ width: '100px', height: '100%', }} />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk mengoptimalkan proses penetasan telur itik, memastikan kesuksesan menetas maksimal dan kualitas anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="tab2"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <img src="/assets/DB_penggemukan.webp"
                            alt="DB_penggemukan"
                            style={{ width: '100px', height: '100%', }} />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk mengoptimalkan proses penetasan telur itik, memastikan kesuksesan menetas maksimal dan kualitas anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="tab3"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <img src="/assets/DB_layer.webp"
                            alt="DB_layeri"
                            style={{ width: '100px', height: '100%', }} />
                          <p>
                            Penetasan merupakan fitur yang dirancang untuk mengoptimalkan proses penetasan telur itik, memastikan kesuksesan menetas maksimal dan kualitas anakan itik yang terbaik.
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              <div className="grid grid-cols-2 justify-center gap-5 pt-5">
                <div className="bg-white p-3 rounded-lg shadow-md">
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
                                `${formatNumber(number)}`}
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
                                `${formatNumber(number)}`}
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
                                `${formatNumber(number)}`}
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
                <div className="bg-white p-3 rounded-lg shadow-md">
                </div>
              </div>
            </div>

            {/* Riwayat */}
            <div className="flex justify-center p-5 gap-5 pl-0">
              <div className="bg-white p-3 rounded-lg shadow-md w-200">
                <h2 className="text-lg sm-bold">Riwayat Analisis</h2>
                <Grid container spacing={3}>
                  {dataAnalisis.map((data, index) => (
                    <Grid item xs={12} key={index}>
                      <Card style={styles.card}>
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
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-sm flex-center">@si-itik.polije</h1>
          </div>
        </div>
      </SidebarDemo>
    </div>
  );
}