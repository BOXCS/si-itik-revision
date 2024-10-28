"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";
import SidebarHandler from "@/components/SidebarHandler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RootLayout from "../layout";
import { Card } from '@/components/ui/card';
import Image from "next/image";
import { AreaChart } from "@/components/ui/chart"

export default function Dashboard() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "User";
  const images = [
    "/assets/DB_layer.webp",
    "/assets/DB_penggemukan.webp",
    "/assets/Layer.svg",
  ];

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

  // return <div>Selamat Datang {username}</div>;
  // <a href="">analisis penetasan</a>
  const chartdata = [
    { date: "Jan", Revenue: 2890, Cost: 2338, },
    { date: "Feb", Revenue: 2756, Cost: 2103, },
    { date: "Mar", Revenue: 3322, Cost: 2194, },
    { date: "Apr", Revenue: 3470, Cost: 2108, },
    { date: "May", Revenue: 3475, Cost: 1812, },
    { date: "Jun", Revenue: 3129, Cost: 1726, },
    { date: "Jul", Revenue: 3490, Cost: 1982, },
    { date: "Aug", Revenue: 2903, Cost: 2012, },
    { date: "Sep", Revenue: 2643, Cost: 2342, },
    { date: "Oct", Revenue: 2837, Cost: 2473, },
    { date: "Nov", Revenue: 2954, Cost: 3848, },
    { date: "Dec", Revenue: 3239, Cost: 3736, },
  ]

  return (
    <div>
      <SidebarDemo>
        <div className="flex-1 items-center justify-center">
          {/* Title Menu */}
          <div className="flex flex-wrap justify-between p-5">
            <h1 className="text-1xl font-bold">Beranda
            </h1>
            <h1 className="text-sm ">{username} </h1>
          </div>

          <div className="flex flex-cols grid-rows-2 pb-0">

            {/* Main */}
            <div className="flex-1 flex-wrap grid-cols items-center justify-center p-5 pb-0">
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
                          <img src="/assets/DB_layer.webp"
                            alt="DB_layeri"
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


              <div className="grid grid-cols-2 justify-center gap-5">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <AreaChart
                    className=" flex items-center justify-center h-50"
                    data={chartdata}
                    index="date"
                    categories={["Revenue", "Cost"]}
                    valueFormatter={(number: number) =>
                      `Rp${formatNumber(number)}`}
                    onValueChange={(v) => console.log(v)}
                  />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md">
                </div>
              </div>
            </div>

            <div className="flex justify-center p-5 gap-5 pl-0">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <AreaChart
                  className=" flex items-center justify-center h-50 w-80"
                  data={chartdata}
                  index="date"
                  categories={["Revenue", "Cost"]}
                  valueFormatter={(number: number) =>
                    `Rp${formatNumber(number)}`}
                  onValueChange={(v) => console.log(v)}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarDemo>
    </div>
  );
}
