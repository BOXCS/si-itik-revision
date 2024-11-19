"use client";
import React, { useState, useEffect, CSSProperties, useMemo } from "react";
// import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SidebarDemo } from "@/components/Sidebar";
import { Timestamp } from "firebase/firestore"; // Import Timestamp to handle Firebase Timestamps
import { firestore, auth } from "@/lib/firebase";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Typography from '@mui/material/Typography';


// Modal Styles for Cards
const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    width: '80%',
    maxWidth: '1000px', // Lebih lebar agar lebih banyak kartu bisa ditampilkan
    boxSizing: 'border-box',
    position: 'relative', // Agar tombol Close di bawah bisa menggunakan posisi absolute
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: 'black',
    cursor: 'pointer',
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  closeButtonBottom: {
    backgroundColor: 'white', // Warna ungu
    color: 'purple', // Warna teks putih
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold', // Membuat teks menjadi bold
    cursor: 'pointer',
    position: 'absolute',
    bottom: '10px', // Letakkan di bagian bawah
    right: '10px', // Letakkan di sisi kanan
    padding: '10px 20px', // Padding agar tombol lebih besar dan mudah diklik
    borderRadius: '5px', // Sudut tombol melengkung
    transition: 'background-color 0.3s ease', // Animasi transisi saat hover
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row', // Menampilkan kartu secara horizontal
    flexWrap: 'wrap', // Agar kartu bisa membungkus ke baris berikutnya jika ruang tidak cukup
    justifyContent: 'center', // Memusatkan kartu secara horizontal
    gap: '30px', // Jarak antar kartu lebih besar
  },
  card: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Menambahkan bayangan hitam
    transition: 'box-shadow 0.3s ease', // Efek bayangan ketika hover
    width: '30%', // Setiap kartu akan mengambil sekitar 30% dari lebar kontainer
    boxSizing: 'border-box',
    margin: 'auto', // Menjaga kartu tetap terpusat dalam baris
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  cardContent: {
    marginTop: '10px',
  },
};



const styles: { [key: string]: CSSProperties } = {
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
  table: {
    display: "flex",
    flexDirection: "row" as "row" | "column" | "row-reverse" | "column-reverse", // Explicit type
    flexWrap: "wrap" as "wrap" | "nowrap" | "wrap-reverse", // Explicit type
    gap: "20px",
    marginTop: "20px",
  },
  cell: {
    padding: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
    minWidth: "150px",
    backgroundColor: "#FFFFFF",//ganati background card
    color: "#fff",
    textAlign: "left",
  },
  error: {
    color: "red",
    marginTop: "20px",
  },
  detailContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "5px",
  },
};




// Helper function to format Firebase Timestamp
const formatTimestamp = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    const date = timestamp.toDate();
    return date.toLocaleString(); // Or use other date formatting methods as required
  }
  return timestamp;
};

// Component
export default function PercobaanAnalisis() {
  const [user, setUser] = useState<any>()
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [analisisPeriodeData, setAnalisisPeriodeData] = useState<any[]>([]);
  const [penggemukanData, setPenggemukanData] = useState<any[]>([]); // Data for Penggemukan
  const [layerData, setLayerData] = useState<any[]>([]); // Data for Layer
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);




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
        where("userId", "==", userEmail)
      );

      // Query for "detail_penggemukan" collection filtered by userId
      const penggemukanQuery = query(
        collection(firestore, "detail_penggemukan"),
        where("userId", "==", userEmail)
      );

      // Query for "detail_layer" collection filtered by userId
      const layerQuery = query(
        collection(firestore, "detail_layer"),
        where("userId", "==", userEmail)
      );

      // Fetch the data for each query
      const detailSnapshot = await getDocs(detailQuery);
      const penggemukanSnapshot = await getDocs(penggemukanQuery);
      const layerSnapshot = await getDocs(layerQuery);



      // detail penetasan 
      if (!detailSnapshot.empty) {
        // console.log(detailSnapshot.docs);

        const newDetailData = detailSnapshot.docs.map(item => {
          return {
            id: item.id,
            detail: [{

            }],
            ...item.data(),
          }
        });

        newDetailData.forEach(async (item: any, index: number) => {
          const docRef = doc(firestore, "detail_penetasan", item.id);
          const docSnapshot = await getDoc(docRef);

          // console.log("tess " + docRef);

          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
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
        })

      } else {
        console.log("No detail penetasan data found.");
      }


      // Replace detailSnapshot with penggemukanSnapshot
      if (!penggemukanSnapshot.empty) {
        // console.log(penggemukanSnapshot.docs);

        const newPenggemukanData = penggemukanSnapshot.docs.map(item => {
          return {
            id: item.id,
            detail: [{}], // Adjust as necessary
            ...item.data(),
          };
        });

        newPenggemukanData.forEach(async (item: any, index: number) => {
          const docRef = doc(firestore, "detail_penggemukan", item.id); // Change "detail_penetasan" to "detail_penggemukan"
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
      
        const newLayerData = layerSnapshot.docs.map(item => {
          return {
            id: item.id,
            detail: [{}], // Adjust as necessary
            ...item.data(),
          };
        });
      
        newLayerData.forEach(async (item: any, index: number) => {
          const docRef = doc(firestore, "detail_layer", item.id); // Change "detail_penggemukan" to "detail_layer"
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






  // Fetch data from Firestore
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const detailCollectionRef = collection(db, "detail_penetasan");
  //       const q = query(detailCollectionRef, orderBy("created_at", "desc"));
  //       const querySnapshot = await getDocs(q);

  //       if (querySnapshot.empty) {
  //         setError("No detail data available.");
  //       } else {
  //         const detailList = await Promise.all(querySnapshot.docs.map(async (doc) => {
  //           const data = doc.data();

  //           return {
  //             id: doc.id,
  //             analisis_periode: data.analisis_periode || "N/A",
  //             created_at: data.created_at,  // This will contain Timestamp
  //           };
  //         }));
  //         setDetailData(detailList);
  //       }

  //       // Fetch data for Penggemukan
  //       const penggemukanRef = collection(db, "detail_penggemukan");
  //       const penggemukanSnapshot = await getDocs(penggemukanRef);

  //       const penggemukanList = penggemukanSnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setPenggemukanData(penggemukanList);

  //       // Fetch data for Layer
  //       const layerRef = collection(db, "detail_layer");
  //       const layerSnapshot = await getDocs(layerRef);

  //       const layerList = layerSnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setLayerData(layerList);

  //     } catch (error) {
  //       console.error("Error fetching detail data:", error);
  //       setError("Error fetching data. Please try again later.");
  //     }
  //   };
  //   fetchData();
  // }, []);

  const handleClick = async (id: string, type: string) => {
    try {
      const docRef = doc(firestore, type, id);
      const docSnapshot = await getDoc(docRef);

      // console.log(docSnapshot);


      if (docSnapshot.exists()) {
        setSelectedDetail(docSnapshot.data());



        // Fetch 'analisis_periode' for the selected item
        const analisisPeriodeRef = collection(docRef, "analisis_periode");
        const analisisPeriodeSnapshot = await getDocs(analisisPeriodeRef);

        // console.log(analisisPeriodeSnapshot);


        if (!analisisPeriodeSnapshot.empty) {
          const analisisData = analisisPeriodeSnapshot.docs.map((doc) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });

          console.log(analisisData);

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


  return (
    <div style={styles.pageContainer}>
      <SidebarDemo>
        <div style={{ ...styles.contentContainer, height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>Selamat datang, {user?.displayName ?? "User"}</h1>
          </div>
          {error && <p style={styles.error}>{error}</p>}

          {/* Detail Penetasan */}
          <h2>Detail Penetasan</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {detailData.map((item, i) => <CardDetailPenetasan item={item} key={i} clickDetail={() => handleClick(item.id, 'detail_penetasan')} />)}
          </div>

          {/* Detail Penggemukan */}
          <h2>Detail Penggemukan</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {penggemukanData.map((item, i) => <CardDetailPenggemukan item={item} key={i} clickDetail={() => handleClick(item.id, 'detail_penggemukan')} />)}
          </div>





          {/* Detail Layer */}
          <h2>Detail Layer</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {layerData.map((item, i) => <CardDetaillayer item={item} key={i} clickDetail={() => handleClick(item.id, 'detail_layer')} />)}
          </div>


             
        </div>
              
                     
      </SidebarDemo>

      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button style={modalStyles.closeButton} onClick={() => setIsModalOpen(false)}>X</button>
            <h3>Detail: {selectedDetail?.analisis_periode || selectedDetail?.nama}</h3>
            <div style={modalStyles.cardContainer}>
              {analisisPeriodeData.length > 0 ? (
                analisisPeriodeData.map((data) => (
                  <div key={data.id} style={modalStyles.card}>
                    <div style={modalStyles.cardTitle}>
                      <h3> {data.periode}</h3>
                    </div>
                    <div style={modalStyles.cardContent}>
                      <p><strong>BEP Hasil:</strong> {data.hasilAnalisis.bepHasil.toLocaleString()}</p>
                      <p><strong>BEP Harga:</strong> {data.hasilAnalisis.bepHarga.toLocaleString()}</p>
                      <p><strong>RC Ratio:</strong> {data.hasilAnalisis.rcRatio.toLocaleString()}</p>
                      <p><strong>Margin of Safety:</strong> {data.hasilAnalisis.marginOfSafety.toLocaleString()}</p>
                      <p><strong>Laba:</strong> {data.hasilAnalisis.laba.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No analisis data available.</p>
              )}
            </div>

            {/* Tombol Close di bagian bawah kanan */}
            <button style={modalStyles.closeButtonBottom} onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

}

const CardDetailPenetasan = ({ item, clickDetail }: { item: any, clickDetail: () => {} }) => {


  const [totalLaba, setTotalLaba] = useState(0)

  useEffect(() => {
    let total = 0;
    item?.detail.forEach((data: any) => {
      total += data?.hasilAnalisis?.laba || 0;
    })

    // console.log(item.detail);


    setTotalLaba(total)

  }, [])

  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '200px', // Fixed width
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    }}
  >
    {/* Title */}
    <strong style={{ color: 'black', fontSize: '16px', marginBottom: '5px' }}>Detail Penetasan</strong>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Button and Icon Section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
      <img
        src="/assets/Group.png" // Replace with the actual icon path
        alt="Icon"
        style={{ width: '30px', height: '30px' }}
      />
      <button
        style={{
          padding: '5px 15px',
          backgroundColor: '#FF8A00',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onClick={clickDetail}
      >
        Lihat Detail
      </button>
    </div>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
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
        !isNaN(item.Laba) ? (
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
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Date and Time Section */}
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleDateString("id-ID")}
        </p>
      </div>
    </div>

  </div>
}

const CardDetailPenggemukan = ({ item, clickDetail }: { item: any, clickDetail: () => {} }) => {


  const [totalLaba, setTotalLaba] = useState(0)

  useEffect(() => {
    let total = 0;
    item?.detail.forEach((data: any) => {
      total += data?.hasilAnalisis?.laba || 0;
    })

    // console.log(item.detail);


    setTotalLaba(total)

  }, [])

  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '200px', // Fixed width
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    }}
  >
    {/* Title */}
    <strong style={{ color: 'black', fontSize: '16px', marginBottom: '5px' }}>Detail Penggemukan</strong>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Button and Icon Section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
      <img
        src="/assets/Group.png" // Replace with the actual icon path
        alt="Icon"
        style={{ width: '30px', height: '30px' }}
      />
      <button
        style={{
          padding: '5px 15px',
          backgroundColor: '#FF8A00',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onClick={clickDetail}
      >
        Lihat Detail
      </button>
    </div>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
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
        !isNaN(item.Laba) ? (
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
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Date and Time Section */}
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleDateString("id-ID")}
        </p>
      </div>
    </div>

  </div>
}
const CardDetaillayer = ({ item, clickDetail }: { item: any, clickDetail: () => {} }) => {


  const [totalLaba, setTotalLaba] = useState(0)

  useEffect(() => {
    let total = 0;
    item?.detail.forEach((data: any) => {
      total += data?.hasilAnalisis?.laba || 0;
    })

    // console.log(item.detail);


    setTotalLaba(total)

  }, [])

  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '200px', // Fixed width
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    }}
  >
    {/* Title */}
    <strong style={{ color: 'black', fontSize: '16px', marginBottom: '5px' }}>Detail Penggemukan</strong>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Button and Icon Section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
      <img
        src="/assets/Group.png" // Replace with the actual icon path
        alt="Icon"
        style={{ width: '30px', height: '30px' }}
      />
      <button
        style={{
          padding: '5px 15px',
          backgroundColor: '#FF8A00',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onClick={clickDetail}
      >
        Lihat Detail
      </button>
    </div>

    {/* Separator Line */}
    <hr
      style={{
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
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
        !isNaN(item.Laba) ? (
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
        width: '100%',
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '10px 0',
      }}
    />

    {/* Date and Time Section */}
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div>
        <p style={{ color: "#333", fontSize: "11px", textAlign: "left" }}>
          {item.created_at.toDate().toLocaleDateString("id-ID")}
        </p>
      </div>
    </div>

  </div>
}
