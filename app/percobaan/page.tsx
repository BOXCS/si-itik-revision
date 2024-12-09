"use client";
import React, { useState, useEffect, CSSProperties, Suspense } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { SidebarDemo } from "@/components/Sidebar";
// import { Timestamp } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { AreaChart } from "@/components/ui/chart";

// Modal Styles for Cards
const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    height: "100%",
    padding: "20px",
    borderRadius: "10px",
    width: "80%",
    maxWidth: "1000px", // Lebih lebar agar lebih banyak kartu bisa ditampilkan
    boxSizing: "border-box",
    position: "relative", // Agar tombol Close di bawah bisa menggunakan posisi absolute
    overflowY: "auto",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "black",
    cursor: "pointer",
    position: "absolute",
    top: "10px",
    right: "10px",
  },
  closeButtonBottom: {
    backgroundColor: "white", // Warna ungu
    color: "purple", // Warna teks putih
    border: "none",
    fontSize: "16px",
    fontWeight: "bold", // Membuat teks menjadi bold
    cursor: "pointer",
    position: "absolute",
    bottom: "10px", // Letakkan di bagian bawah
    right: "10px", // Letakkan di sisi kanan
    padding: "10px 20px", // Padding agar tombol lebih besar dan mudah diklik
    borderRadius: "5px", // Sudut tombol melengkung
    transition: "background-color 0.3s ease", // Animasi transisi saat hover
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column", // Menampilkan kartu secara horizontal
    flexWrap: "wrap", // Agar kartu bisa membungkus ke baris berikutnya jika ruang tidak cukup
    width: "100%",
    justifyContent: "center", // Memusatkan kartu secara horizontal
    gap: "30px", // Jarak antar kartu lebih besar
  },
  card: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Menambahkan bayangan hitam
    transition: "box-shadow 0.3s ease", // Efek bayangan ketika hover
    width: "100%", // Setiap kartu akan mengambil sekitar 30% dari lebar kontainer
    boxSizing: "border-box",
    margin: "auto", // Menjaga kartu tetap terpusat dalam baris
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  cardContent: {
    marginTop: "10px",
  },
};

// const styles: { [key: string]: CSSProperties } = {
//   pageContainer: {
//     background: "linear-gradient(180deg, #FFD580, #FFCC80)",
//     minHeight: "100vh",
//     padding: "0px",
//     margin: "0px",
//     fontFamily: "'Arial', sans-serif",
//   },
//   contentContainer: {
//     padding: "20px",
//   },
//   titleContainer: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "20px",
//   },
//   title: {
//     color: "#333",
//     marginBottom: "20px",
//   },
//   table: {
//     display: "flex",
//     flexDirection: "row" as "row" | "column" | "row-reverse" | "column-reverse", // Explicit type
//     flexWrap: "wrap" as "wrap" | "nowrap" | "wrap-reverse", // Explicit type
//     gap: "20px",
//     marginTop: "20px",
//   },
//   cell: {
//     padding: "10px",
//     border: "1px solid #ddd",
//     cursor: "pointer",
//     minWidth: "150px",
//     backgroundColor: "#FFFFFF", //ganati background card
//     color: "#fff",
//     textAlign: "left",
//   },
//   error: {
//     color: "red",
//     marginTop: "20px",
//   },
//   detailContainer: {
//     marginTop: "20px",
//     padding: "10px",
//     backgroundColor: "#f0f0f0",
//     borderRadius: "5px",
//   },
// };

// Component
export default function PercobaanAnalisis() {
  const [user, setUser] = useState<any>();
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [analisisPeriodeData, setAnalisisPeriodeData] = useState<any[]>([]);
  const [penggemukanData, setPenggemukanData] = useState<any[]>([]); // Data for Penggemukan
  const [layerData, setLayerData] = useState<any[]>([]); // Data for Layer
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState<
    { Prd: number; Revenue: string; Cost: string; Laba: string }[]
  >([]);

  console.log("user telah tiba di riwayat" + user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);

        setUser(user);
        fetchUserSpecificData(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserSpecificData = async (user: any) => {
    try {
      const userEmail = user.email;
      console.log(userEmail);

      console.log("Email pengguna:", userEmail);

      // Query for "detail_penetasan" collection filtered by userId
      const detailQuery = query(
        collection(firestore, "detail_penetasan"),
        where("userId", "==", userEmail),
        orderBy("created_at", "desc")
      );

      // Query for "detail_penggemukan" collection filtered by userId
      const penggemukanQuery = query(
        collection(firestore, "detail_penggemukan"),
        where("userId", "==", userEmail),
        orderBy("created_at", "desc")
      );

      // Query for "detail_layer" collection filtered by userId
      const layerQuery = query(
        collection(firestore, "detail_layer"),
        where("userId", "==", userEmail),
        orderBy("created_at", "desc")
      );

      // Fetch the data for each query
      const detailSnapshot = await getDocs(detailQuery);
      const penggemukanSnapshot = await getDocs(penggemukanQuery);
      const layerSnapshot = await getDocs(layerQuery);

      // detail penetasan
      if (!detailSnapshot.empty) {
        // console.log(detailSnapshot.docs);

        const newDetailData = detailSnapshot.docs.map((item) => {
          return {
            id: item.id,
            detail: [{}],
            ...item.data(),
          };
        });

        newDetailData.forEach(async (item: any, index: number) => {
          const docRef = doc(db, "detail_penetasan", item.id);
          const docSnapshot = await getDoc(docRef);

          // console.log("tess " + docRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("dataaaaaa " + data);
          }

          const analisisPeriodeRef = collection(docRef, "analisis_periode");
          const analisisPeriodeSnapshot = await getDocs(analisisPeriodeRef);

          if (!analisisPeriodeSnapshot.empty) {
            const analisisData = analisisPeriodeSnapshot.docs.map((it) => ({
              id: it.id,
              ...it.data(),
            }));

            newDetailData[index].detail = analisisData;
            setDetailData(newDetailData); // Update state for detail penetasan
          }
        });
      } else {
        console.log("No detail penetasan data found.");
      }

      // Replace detailSnapshot with penggemukanSnapshot
      if (!penggemukanSnapshot.empty) {
        // console.log(penggemukanSnapshot.docs);

        const newPenggemukanData = penggemukanSnapshot.docs.map((item) => {
          return {
            id: item.id,
            detail: [{}], // Adjust as necessary
            ...item.data(),
          };
        });

        newPenggemukanData.forEach(async (item: any, index: number) => {
          const docRef = doc(db, "detail_penggemukan", item.id); // Change "detail_penetasan" to "detail_penggemukan"
          const docSnapshot = await getDoc(docRef);

          // console.log("tess " + docRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("dataaaaaa " + data);
          }

          const analisisPeriodeRef = collection(docRef, "analisis_periode");
          const analisisPeriodeSnapshot = await getDocs(analisisPeriodeRef);

          if (!analisisPeriodeSnapshot.empty) {
            const analisisData = analisisPeriodeSnapshot.docs.map((it) => ({
              id: it.id,
              ...it.data(),
            }));

            newPenggemukanData[index].detail = analisisData;
            setPenggemukanData(newPenggemukanData); // Update state for detail penggemukan
          }
        });
      } else {
        console.log("No detail penggemukan data found.");
      }

      if (!layerSnapshot.empty) {
        // console.log(layerSnapshot.docs);

        const newLayerData = layerSnapshot.docs.map((item) => {
          return {
            id: item.id,
            detail: [{}], // Adjust as necessary
            ...item.data(),
          };
        });

        newLayerData.forEach(async (item: any, index: number) => {
          const docRef = doc(db, "detail_layer", item.id); // Change "detail_penggemukan" to "detail_layer"
          const docSnapshot = await getDoc(docRef);

          // console.log("tess " + docRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("dataaaaaa " + data);
          }

          const analisisPeriodeRef = collection(docRef, "analisis_periode");
          const analisisPeriodeSnapshot = await getDocs(analisisPeriodeRef);

          if (!analisisPeriodeSnapshot.empty) {
            const analisisData = analisisPeriodeSnapshot.docs.map((it) => ({
              id: it.id,
              ...it.data(),
            }));

            newLayerData[index].detail = analisisData;
            setLayerData(newLayerData); // Update state for detail layer
          }
        });
      } else {
        console.log("No detail layer data found.");
      }
    } catch (error) {
      console.error("Error fetching user specific data:", error);
    }
  };

  const handleClick = async (id: string, type: string) => {
    try {
      const docRef = doc(db, type, id);
      const docSnapshot = await getDoc(docRef);

      // console.log(docSnapshot);

      if (docSnapshot.exists()) {
        setSelectedDetail(docSnapshot.data());

        // Fetch 'analisis_periode' for the selected item
        const analisisPeriodeRef = query(
          collection(docRef, "analisis_periode"),
          orderBy("created_at", "desc") // Mengurutkan berdasarkan created_at descending
        );
        const analisisPeriodeSnapshot = await getDocs(analisisPeriodeRef);

        // console.log(analisisPeriodeSnapshot);

        if (!analisisPeriodeSnapshot.empty) {
          const analisisData = analisisPeriodeSnapshot.docs.map((doc) => {
            return {
              id: doc.id,
              laba: doc.data().hasilAnalisis?.laba || 0,
              periode: doc.data().periode ?? 0,
              revenue: doc.data().penerimaan?.totalRevenue || 0,
              cost: doc.data().pengeluaran?.totalCost || 0,
              ...doc.data(),
            };
          });

          console.log(analisisData);

          setChartData(
            analisisData.map((item, index) => ({
              Prd: index + 1,
              Revenue: item.revenue,
              Cost: item.cost,
              Laba: item.laba,
            }))
          );
          setAnalisisPeriodeData(analisisData);
        } else {
          setAnalisisPeriodeData([]);
        }

        setIsModalOpen(true);
      } else {
        setError("Detail not found.");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError("Error fetching detail. Please try again later.");
    }
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghapus desimal
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD580] to-[#FFCC80]">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <SidebarDemo>
          <div className="p-6 h-screen w-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                Riwayat Analisis
              </h1>
            </div>

            {error && <p className="text-red-500 mb-6">{error}</p>}

            {/* Sections */}
            <div className="space-y-8">
              {/* Penetasan Section */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 bg-[#F58110] h-8 rounded-full text-center mb-4">
                  Detail Penetasan
                </h2>
                <div className="flex flex-wrap gap-4">
                  {detailData.map((item, i) => (
                    <CardDetailPenetasan
                      item={item}
                      key={i}
                      clickDetail={() =>
                        handleClick(item.id, "detail_penetasan")
                      }
                      className="flex-grow basis-[calc(25%-1rem)] max-w-[calc(25%-1rem)] sm:basis-[calc(50%-1rem)] sm:max-w-[calc(50%-1rem)] lg:basis-[calc(33.333%-1rem)] lg:max-w-[calc(33.333%-1rem)] xl:basis-[calc(25%-1rem)] xl:max-w-[calc(25%-1rem)] h-full"
                    />
                  ))}
                </div>
              </section>

              {/* Penggemukan Section */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 bg-[#F58110] h-8 rounded-full text-center mb-4">
                  Detail Penggemukan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {penggemukanData.map((item, i) => (
                    <CardDetailPenggemukan
                      item={item}
                      key={i}
                      clickDetail={() =>
                        handleClick(item.id, "detail_penggemukan")
                      }
                      className="h-full"
                    />
                  ))}
                </div>
              </section>

              {/* Layer Section */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 bg-[#F58110] h-8 rounded-full text-center mb-4">
                  Detail Layer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {layerData.map((item, i) => (
                    <CardDetaillayer
                      item={item}
                      key={i}
                      clickDetail={() => handleClick(item.id, "detail_layer")}
                      className="h-full"
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </SidebarDemo>
      </Suspense>

      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button
              style={modalStyles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
            <h3>
              Detail: {selectedDetail?.analisis_periode || selectedDetail?.nama}
            </h3>
            <div className="flex space-x-4">
              <AreaChart
                className="flex items-center justify-center h-[180px] sm:h-[150px] md:h-[250px] w-full sm:w-[320px] md:w-[100%]"
                data={chartData}
                index="Prd"
                categories={["Revenue", "Cost", "Laba"]}
                valueFormatter={(number: number) => `${formatNumber(number)}`}
                onValueChange={(v) => console.log(v)}
                xAxisLabel="Periode"
                fill="solid"
              />
            </div>
            <div style={modalStyles.cardContainer}>
              {analisisPeriodeData.length > 0 ? (
                analisisPeriodeData.map((data) => (
                  <div key={data.id} style={modalStyles.card}>
                    <div style={modalStyles.cardTitle}>
                      <h3> {data.periode}</h3>
                    </div>
                    <div style={modalStyles.cardContent}>
                      <p>
                        <strong>BEP Hasil:</strong>{" "}
                        {data.hasilAnalisis.bepHasil.toLocaleString()}
                      </p>
                      <p>
                        <strong>BEP Harga:</strong>{" "}
                        {data.hasilAnalisis.bepHarga.toLocaleString()}
                      </p>
                      <p>
                        <strong>RC Ratio:</strong>{" "}
                        {data.hasilAnalisis.rcRatio.toLocaleString()}
                      </p>
                      <p>
                        <strong>Margin of Safety:</strong>{" "}
                        {data.hasilAnalisis.marginOfSafety.toLocaleString()}
                      </p>
                      <p>
                        <strong>Laba:</strong>{" "}
                        {data.hasilAnalisis.laba.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No analisis data available.</p>
              )}
            </div>

            {/* Tombol Close di bagian bawah kanan */}
          </div>
        </div>
      )}
    </div>
  );
}

const CardDetailPenetasan = ({
  item,
  clickDetail,
}: {
  item: any;
  clickDetail: () => void;
  className?: string; // Tambahkan className sebagai opsional
}) => {
  const [totalLaba, setTotalLaba] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (item?.detail) {
      let total = 0;
      item.detail.forEach((data: any) => {
        total += data?.hasilAnalisis?.laba || 0;
      });
      setTotalLaba(total);
    }
  }, [item]); // Recalculate laba whenever item changes

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const style: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    flexBasis: "calc(25% - 15px)",
    maxWidth: "calc(25% - 15px)",
    flexDirection: "column",
    alignItems: "start",
    width: "100%",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    position: "relative", // Required for positioning ID
  };

  if (windowWidth <= 768) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  if (windowWidth <= 480) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  return (
    <div style={style}>
      {/* ID Analisis */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "10px",
          fontSize: "0.61rem",
          fontWeight: "bold",
          color: "#888",
        }}
      >
        ID: {item?.id || "Unknown"}
      </div>

      <strong style={{ color: "black", fontSize: "16px", marginBottom: "5px" }}>
        Detail Penetasan
      </strong>

      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Image
          src="/assets/Group.png"
          alt="Icon"
          width={100}
          height={50}
          layout="fixed"
          className="w-5 h-auto"
        />
        <button
          style={{
            padding: "5px 15px",
            backgroundColor: "#FF8A00",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={clickDetail}
        >
          Lihat Detail
        </button>
      </div>

      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginBottom: "0px",
          height: "20px",
        }}
      >
        {item.Laba !== undefined &&
        item.Laba !== null &&
        !isNaN(Number(item.Laba)) ? (
          <Typography variant="h6">
            Rp. {Number(item.Laba).toLocaleString("id-ID")}
          </Typography>
        ) : (
          <Typography
            variant="h6"
            style={{
              color: "black",
              fontSize: "13px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Rp. {totalLaba.toLocaleString()}
          </Typography>
        )}
      </div>

      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at
              .toDate()
              .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at.toDate().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
};

const CardDetailPenggemukan = ({
  item,
  clickDetail,
}: {
  item: any;
  clickDetail: () => void;
  className?: string;
}) => {
  const [totalLaba, setTotalLaba] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (Array.isArray(item?.detail)) {
      let total = 0;
      item.detail.forEach((data: any) => {
        total += data?.hasilAnalisis?.laba || 0;
      });
      setTotalLaba(total);
    } else {
      setTotalLaba(0); // Set default jika detail tidak valid
    }
  }, [item]); 

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const style: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column", // Ensure 'flexDirection' is valid
    alignItems: "start",
    width: "100%",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    position: "relative",
  };

  // Update the style based on the screen width
  if (windowWidth <= 768) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  if (windowWidth <= 480) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  return (
    <div style={style}>
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          padding: "10px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#888",
        }}
      >
        ID: {item?.id || "unknown"}
      </div>
      {/* Title */}
      <strong style={{ color: "black", fontSize: "16px", marginBottom: "5px" }}>
        Detail Penggemukan
      </strong>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* Button and Icon Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Image
          src="/assets/Duck.png" // Replace with the actual icon path
          alt="Icon"
          width={100} // Atur width dalam pixel
          height={50} // Atur height dalam pixel
          layout="fixed" // Pastikan ukuran gambar tetap
          className="w-8 h-auto"
        />
        <button
          style={{
            padding: "5px 15px",
            backgroundColor: "#FF8A00",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={clickDetail}
        >
          Lihat Detail
        </button>
      </div>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* laba */}
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          width: "100%",
          marginBottom: "0px",
          height: "20px", // Optional: Ensure a fixed height for vertical centering
        }}
      >
        {item.Laba !== undefined && item.Laba !== null && !isNaN(item.Laba) ? (
          <Typography
            variant="h6"
            style={{
              color: "#333",
              fontSize: "13px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Rp. {item.Laba.toLocaleString("id-ID")}
          </Typography>
        ) : (
          <Typography
            variant="h6"
            style={{
              color: "black",
              fontSize: "13px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Rp. {totalLaba.toLocaleString()}
          </Typography>
        )}
      </div>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* Date and Time Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at
              .toDate()
              .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at.toDate().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
};
const CardDetaillayer = ({
  item,
  clickDetail,
}: {
  item: any;
  clickDetail: () => void;
  className?: string;
}) => {
  const [totalLaba, setTotalLaba] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    let total = 0;
    console.log("Detail item:", item?.detail); // Log detail untuk melihat isinya
    item?.detail.forEach((data: any) => {
      console.log("Item data:", data);
      total += data?.hasilAnalisis?.laba || 0;
    });

    setTotalLaba(total);
  }, [item]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const style: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column", // Ensure 'flexDirection' is valid
    alignItems: "start",
    width: "100%",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    position: "relative",
  };

  // Update the style based on the screen width
  if (windowWidth <= 768) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  if (windowWidth <= 480) {
    style.flexBasis = "100%";
    style.maxWidth = "100%";
  }

  return (
    <div style={style}>
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          padding: "10px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#888",
        }}
      >
        ID: {item?.id || "unknown"}
      </div>
      {/* Title */}
      <strong style={{ color: "black", fontSize: "16px", marginBottom: "5px" }}>
        Detail Layer
      </strong>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* Button and Icon Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Image
          src="/assets/Group 109.png" // Replace with the actual icon path
          alt="Icon"
          width={100} // Atur width dalam pixel
          height={50} // Atur height dalam pixel
          layout="fixed" // Pastikan ukuran gambar tetap
          className="w-8 h-auto"
        />
        <button
          style={{
            padding: "5px 15px",
            backgroundColor: "#FF8A00",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={clickDetail}
        >
          Lihat Detail
        </button>
      </div>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* laba */}
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          width: "100%",
          marginBottom: "0px",
          height: "20px", // Optional: Ensure a fixed height for vertical centering
        }}
      >
        {item.Laba !== undefined &&
        item.Laba !== null &&
        !isNaN(Number(item.Laba)) ? (
          <Typography variant="h6">
            Rp. {Number(item.Laba).toLocaleString("id-ID")}
          </Typography>
        ) : (
          <Typography
            variant="h6"
            style={{
              color: "black",
              fontSize: "13px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Rp. {totalLaba.toLocaleString()}
          </Typography>
        )}
      </div>

      {/* Separator Line */}
      <hr
        style={{
          width: "100%",
          border: "none",
          borderTop: "1px solid #ddd",
          margin: "10px 0",
        }}
      />

      {/* Date and Time Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at
              .toDate()
              .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div>
          <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
            {item.created_at.toDate().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
};
