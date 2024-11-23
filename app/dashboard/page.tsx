"use client";

import React, { Suspense, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where, Timestamp, } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
// import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart } from "@/components/ui/chart";
import { Tooltip } from "@/components/ui/tooltip";
import UserAvatar from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from 'next/link';
import Image from "next/image";
// import { cx } from "@/lib/utils";
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

interface AnalysisPeriodData {
  id: string;
  analysisId: string;
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
  // const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(() => {

    if (typeof window !== "undefined") {
      // Kode ini hanya dijalankan di client-side
      return localStorage.getItem('userName') || null;
    }
    return null;
  });
  const [chartDataPenetasan, setChartDataPenetasan] = useState<{ Prd: number; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [chartDataPenggemukan, setChartDataPenggemukan] = useState<{ Prd: number; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [chartDataLayer, setChartDataLayer] = useState<{ Prd: number; Revenue: number; Cost: number; Laba: number; }[]>([]);
  const [dataAnalisis, setDataAnalisis] = useState<AnalysisPeriodData[]>([]);
  const [originalData, setOriginalData] = useState<AnalysisPeriodData[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>("terbaru");

  console.log("email user" + userEmail);

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
      boxShadow: "6px 6px 12px rgba(255, 165, 0, 0.5)",
      padding: "15px",
      cursor: "pointer",
      transition: "transform 0.2s",
      width: "380px", // Atur lebar card
      height: "140px", // Atur tinggi card
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

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const savedPhoto = localStorage.getItem("userPhoto");
      if (savedPhoto) {
        setUserPhoto(savedPhoto); // Gunakan foto dari localStorage
      } else {
        setUserPhoto(currentUser.photoURL || null); // Gunakan foto dari Google
      }
      setUserEmail(currentUser.email || '');
      setUserName(currentUser.displayName || '');
    } else {
      // Coba fetch user kembali jika currentUser  awalnya null
      auth.onAuthStateChanged((user) => {
        if (user) {
          const savedPhoto = localStorage.getItem("userPhoto");
          if (savedPhoto) {
            setUserPhoto(savedPhoto); // Gunakan foto dari localStorage
          } else {
            setUserPhoto(user.photoURL || null); // Gunakan foto dari Google
          }
          setUserEmail(user.email || '');
          setUserName(user.displayName || '');
        }
      });
    }
  }, []);

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
    const savedPhoto = localStorage.getItem("userPhoto");
    if (savedPhoto) {
      setUserPhoto(savedPhoto);
    }
  }, []);

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
            where("userId", "==", userEmail),
            orderBy("created_at", "desc")

          ),
          query(
            collection(firestore, "detail_penggemukan"),
            where("userId", "==", userEmail),
            orderBy("created_at", "desc")

          ),
          query(
            collection(firestore, "detail_layer"),
            where("userId", "==", userEmail),
            orderBy("created_at", "desc")
          ),
        ];

        const userData = await Promise.all(
          detailQueries.map(async (q, index) => {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const subCollectionData: AnalysisPeriodData[] = [];
              for (const userDoc of querySnapshot.docs) {
                const userDocRef = userDoc.ref;
                const subCollectionRef = query(
                  collection(userDocRef, "analisis_periode"),
                  orderBy("periode", "asc")
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
                    periode: doc.data().periode ?? 0,
                    revenue: doc.data().penerimaan?.totalRevenue || 0,
                    cost: doc.data().pengeluaran?.totalCost || 0,
                    marginOfSafety: doc.data().hasilAnalisis?.marginOfSafety || 0,
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

        {/* Chart */ }
        const [penetasanData, penggemukanData, layerData] = await Promise.all(
          detailQueries.map(async (q, index) => {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const latestDoc = querySnapshot.docs[0]; // Ambil dokumen terbaru
              const userDocRef = latestDoc.ref;

              // Ambil data dari subkoleksi analisis_periode
              const subCollectionRef = query(
                collection(userDocRef, "analisis_periode"),
                orderBy("periode", "asc")
              );
              const subCollectionSnapshot = await getDocs(subCollectionRef);

              if (subCollectionSnapshot.empty) {
                console.log(
                  `Subcollection analisis_periode kosong untuk dokumen: ${userDocRef.id}`
                );
                return []; // Abaikan jika analisis_periode kosong
              }

              const analysisNames = [
                "Detail Penetasan",
                "Detail Penggemukan",
                "Detail Layer",
              ];
              const analysisName = analysisNames[index];

              return subCollectionSnapshot.docs.map((doc) => ({
                id: doc.id,
                analysisId: latestDoc.id,
                created_at: doc.data().created_at || Timestamp.now(),
                bepHarga: doc.data().hasilAnalisis?.bepHarga || 0,
                bepHasil: doc.data().hasilAnalisis?.bepHasil || 0,
                laba: doc.data().hasilAnalisis?.laba || 0,
                periode: doc.data().periode ?? 0,
                revenue: doc.data().penerimaan?.totalRevenue || 0,
                cost: doc.data().pengeluaran?.totalCost || 0,
                marginOfSafety: doc.data().hasilAnalisis?.marginOfSafety || 0,
                rcRatio: doc.data().hasilAnalisis?.rcRatio || 0,
                analysisName: analysisName,
              }));
            }
            return [];
          })
        );

        setChartDataPenetasan(penetasanData.map((item, index) => ({
          Prd: index + 1,
          Revenue: item.revenue,
          Cost: item.cost,
          Laba: item.laba,
        })));

        setChartDataPenggemukan(penggemukanData.map((item, index) => ({
          Prd: index + 1,
          Revenue: item.revenue,
          Cost: item.cost,
          Laba: item.laba,
        })));

        setChartDataLayer(layerData.map((item, index) => ({
          Prd: index + 1,
          Revenue: item.revenue,
          Cost: item.cost,
          Laba: item.laba,
        })));

        // Menggabungkan data berdasarkan analysisName
        const aggregatedData: { [key: string]: AnalysisPeriodData } = {};

        userData.flat().forEach((data) => {
          const key = data.analysisId; // Gunakan analysisName sebagai kunci untuk pengelompokan
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

        console.log("Data yang sudah digabungkan:", aggregatedData);

        // Convert the aggregated data back to an array and update state
        setDataAnalisis(Object.values(aggregatedData));
        setOriginalData(Object.values(aggregatedData));
        setDataAnalisis(Object.values(aggregatedData)); // Simpan data asli
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
      sortedData = sortedData.filter((data) => data.analysisName === "Detail Penetasan");
    } else if (criteria === "detail_penggemukan") {
      sortedData = sortedData.filter((data) => data.analysisName === "Detail Penggemukan");
    } else if (criteria === "detail_layer") {
      sortedData = sortedData.filter((data) => data.analysisName === "Detail Layer");
    }
    setDataAnalisis(sortedData);
  };

  const analysisImages: { [key: string]: string } = {
    "Detail Penetasan": "/assets/Telur.svg", // Ganti dengan path yang sesuai
    "Detail Penggemukan": "/assets/Duck.png", // Ganti dengan path yang sesuai
    "Detail Layer": "/assets/Group 109.png", // Ganti dengan path yang sesuai
  };

  const formatNumbers = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghapus desimal
      maximumFractionDigits: 0,
    }).format(num);

  const createLinkWithUsername = (href: string) =>
    `${href}?username=${userName}`;

  return (
    <div>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SidebarDemo>
        <div className="flex-1 items-center justify-center">
          {/* Title Menu */}
          <div className="flex flex-wrap justify-between p-5">
            <h1 className="text-1xl font-bold">Beranda </h1>
            <Tooltip
              side="bottom"
              showArrow={false}
              content={userName}
            >
              <Link href={createLinkWithUsername('/user_setting')}> {/* Ganti "/pengaturan" */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full"><UserAvatar photoURL={userPhoto} /> </div>
                  </div>
                </div>
              </Link>
            </Tooltip>
          </div>

          <div className="flex flex-col md:flex-row h-screen overflow-y-auto grid-rows-2 g-5 p-5 pt-0">
            {/* Main */}
            <div className="flex-1 flex-wrap 4grid-cols items-center justify-center">
              {/* Card Tab */}
              <div className="flex-1 bg-white to-orange-100 rounded-lg shadow-md height-1/2 p-8 pb-5">
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
                            src="/assets/DB_Penetasan.png"
                            alt="DB_penggemukan"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-24" // Kelas Tailwind untuk kontrol tambahan
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
                            src="/assets/DB_penggemukan.png"
                            alt="DB_penggemukan"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-24" // Kelas Tailwind untuk kontrol tambahan
                          />
                          <p>
                            Penggemukan merupakan fitur yang dirancang untuk mengoptimalkan proses penggemukan itik yang bertujuan untuk meningkatkan kualitas daging itik, sehingga memiliki nilai jual daging itik yang lebih di pasaran.
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="tab3"
                        className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                      >
                        <div className="flex space-x-4">
                          <Image
                            src="/assets/DB_layer.png"
                            alt="DB_layeri"
                            width={100} // Atur width dalam pixel
                            height={50} // Atur height dalam pixel
                            layout="fixed" // Pastikan ukuran gambar tetap
                            className="w-24 h-24" // Kelas Tailwind untuk kontrol tambahan
                          />
                          <p>
                            Layer merupakan fitur yang dirancang untuk melihat kualitas dan biaya yang keluarkan saat itik dalam proses hamil, sehingga nanti dapa menghindari gagalnya itik bertelur.
                          </p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              {/*Chart Tab*/}
              <div className="flex justify-center gap-5 pt-5 pb-5">
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
                          {chartDataPenetasan.length > 0 ? (
                            <div className="flex space-x-4">
                              <AreaChart
                                className="flex items-center justify-center h-50"
                                data={chartDataPenetasan}
                                index="Prd"
                                categories={["Revenue", "Cost", "Laba"]}
                                valueFormatter={(number: number) => `${formatNumbers(number)}`}
                                onValueChange={(v) => console.log(v)}
                                xAxisLabel="Periode"
                                fill="solid"
                              />
                            </div>
                          ) : (
                            <div className="flex bg-white items-center justify-center" style={{ height: "320px" }}>
                              <Typography
                                variant="body1"
                                style={{ color: "gray", fontStyle: "italic" }}
                              >
                                Tidak ada data analisis.
                              </Typography>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent
                          value="tab2"
                          className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                          {chartDataPenggemukan.length > 0 ? (
                            <div className="flex space-x-4">
                              <AreaChart
                                className="flex items-center justify-center h-50"
                                data={chartDataPenggemukan}
                                index="Prd"
                                categories={["Revenue", "Cost", "Laba"]}
                                valueFormatter={(number: number) => `${formatNumbers(number)}`}
                                onValueChange={(v) => console.log(v)}
                                xAxisLabel="Periode"
                                fill="solid"
                              />
                            </div>
                          ) : (
                            <div className="flex bg-white items-center justify-center" style={{ height: "320px" }}>
                              <Typography
                                variant="body1"
                                style={{ color: "gray", fontStyle: "italic" }}
                              >
                                Tidak ada data analisis.
                              </Typography>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent
                          value="tab3"
                          className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                          {chartDataLayer.length > 0 ? (
                            <div className="flex space-x-4">
                              <AreaChart
                                className="flex items-center justify-center h-50"
                                data={chartDataLayer}
                                index="Prd"
                                categories={["Revenue", "Cost", "Laba"]}
                                valueFormatter={(number: number) => `${formatNumbers(number)}`}
                                onValueChange={(v) => console.log(v)}
                                xAxisLabel="Periode"
                                fill="solid"
                              />
                            </div>
                          ) : (
                            <div className="flex bg-white items-center justify-center" style={{ height: "320px" }}>
                              <Typography
                                variant="body1"
                                style={{ color: "gray", fontStyle: "italic" }}
                              >
                                Tidak ada data analisis.
                              </Typography>
                            </div>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat */}
            <div className="flex justify-center pl-5 gap-5">
              {/* Parent Card */}
              <div className="bg-white p-3" style={{ width: '400px', height: '606px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center grid grid-cols-1 justify-between">
                  <div className="flex items-center justify-between pb-3"
                    style={{ maxHeight: '500px' }}>
                    <Typography
                      variant="h6"
                    >
                      Riwayat Analisis
                    </Typography>
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
                          <MenuItem value="detail_penetasan">Detail Penetasan</MenuItem>
                          <MenuItem value="detail_penggemukan">Detail Penggemukan</MenuItem>
                          <MenuItem value="detail_layer">Detail Layer</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>

                  {/*Card Riwayat Analisis */}
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {dataAnalisis.length > 0 ? (
                      <Grid container spacing={3} style={{ width: "100%", margin: "0" }}>
                        {dataAnalisis.map((data, index) => (
                          <Grid item xs={12} key={index} style={{ paddingLeft: "0px" }}>
                            <Card style={{
                              ...styles.card,
                              flexDirection: "column",
                              width: "100%",
                              height: "140px",
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
                                <Image
                                  src={analysisImages[data.analysisName]}
                                  alt={data.analysisName}
                                  width={25}
                                  height={25}
                                  layout="fixed"
                                  className="w-5 h-auto"
                                />
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
                              </Grid>

                              {/* Garis pemisah */}
                              <Divider style={{ margin: "10px 0" }} />

                              {/* Display Time and Date */}
                              <Grid container justifyContent="space-between">
                                <Typography variant="body2" style={styles.time}>
                                  {data.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </Typography>
                                <Typography variant="body2" style={styles.date}>
                                  {data.created_at.toDate().toLocaleDateString()}
                                </Typography>
                              </Grid>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Typography
                          variant="body1"
                          style={{ color: "gray", fontStyle: "italic" }}
                        >
                          Tidak ada riwayat.
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm">@si-itik.polije</p>
          </div>
        </div>
      </SidebarDemo>
      </Suspense>
    </div>
  );
}