"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore } from '@/lib/firebase'; // Import konfigurasi Firebase Anda

interface AnalysisPeriodData {
  id: string;
  created_at: Timestamp; 
  bepHarga: number;
  bepHasil: number;
  laba: number;
  marginOfSafety: number;
  rcRatio: number;
}

const GetDataPage = () => {
  const [data, setData] = useState<AnalysisPeriodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    // Memeriksa status login menggunakan onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Ambil email pengguna
      } else {
        console.error("Pengguna tidak login!");
      }
    });
    return () => unsubscribe(); // Bersihkan listener saat komponen di-unmount
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      try {
        console.log("Mencari dokumen dengan email:", userEmail);

        // Query untuk mencari dokumen berdasarkan userId (email)
        const detailPenetasanQuery = query(
          collection(firestore, "detail_penetasan"),
          where("userId", "==", userEmail)
        );

        const querySnapshot = await getDocs(detailPenetasanQuery);

        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref; // Ambil referensi dokumen pertama
          const subCollectionRef = collection(userDocRef, "analisis_periode");
          const subCollectionSnapshot = await getDocs(subCollectionRef);

          // Log untuk memeriksa subCollectionSnapshot
          console.log("SubCollection Snapshot:", subCollectionSnapshot.docs);

          const fetchedData: AnalysisPeriodData[] = subCollectionSnapshot.docs.map((doc) => {
            const docData = doc.data();
            console.log("Data Dokumen:", docData);

            // Ambil data dari objek hasilAnalisis
            const hasilAnalisis = docData.hasilAnalisis || {};

            return {
              id: doc.id,
              created_at: docData.created_at || Timestamp.now(),
              bepHarga: hasilAnalisis.bepHarga ?? 0, // Mengakses dari objek hasilAnalisis
              bepHasil: hasilAnalisis.bepHasil ?? 0, // Mengakses dari objek hasilAnalisis
              laba: hasilAnalisis.laba ?? 0, // Mengakses dari objek hasilAnalisis
              marginOfSafety: hasilAnalisis.marginOfSafety ?? 0, // Mengakses dari objek hasilAnalisis
              rcRatio: hasilAnalisis.rcRatio ?? 0, // Mengakses dari objek hasilAnalisis
            } as AnalysisPeriodData;
          });

          setData(fetchedData);
          console.log("Data yang di-set:", fetchedData);
        } else {
          console.error("Dokumen tidak ditemukan untuk email yang diberikan!");
        }
      } catch (error) {
        console.error("Error mengambil data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Data Page</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {/* Tampilkan data sesuai dengan field yang ada di koleksi Firestore */}
            BEP Harga: {item.bepHarga}, BEP Hasil: {item.bepHasil}, Laba: {item.laba}, email: {userEmail}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetDataPage;
