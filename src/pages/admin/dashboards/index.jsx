import Head from 'next/head'
import Sidebar from '@/components/admin/layouts/Sidebar'
import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import { UsersIcon, UserGroupIcon, HomeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';

export default function Dashboard() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();

    const [totalNumberofHouseholds, setTotalNumberofHouseholds] = useState(0);
    const [totalNumberofFamilies, setTotalNumberofFamilies] = useState(0);
    const [totalNumberofDeaths, setTotalNumberofDeaths] = useState(0);
    const [totalNumberofUsers, setTotalNumberofUsers] = useState(0);
    
    useEffect(() => {
    // Fetch data from Supabase
    const fetchData = async () => {
        const { data: households, error: householdsError } = await supabase
            .from('households')
            .select('*', { count: 'exact' });
            

        if (householdsError) {
            console.error('Error fetching total number of households:', householdsError);
            return;
        }
        const { data: families, error: familiesError } = await supabase
            .from('families')
            .select('*', { count: 'exact' })
            .eq('isDeath', 'No');

        if (familiesError) {
            console.error('Error fetching total number of families:', familiesError);
            return;
        }
        const { data: deaths, error: deathsError } = await supabase
            .from('deaths')
            .select('*', { count: 'exact' });
        if (deathsError) {
            console.error('Error fetching total number of deaths:', deathsError);
            return;
        }
        // const { data: users, error: usersError } = await supabase
        //     .from('users')
        //     .select('*', { count: 'exact' });
        // if (usersError) {
        //     console.error('Error fetching total number of users:', usersError);
        //     return;
        // }

        setTotalNumberofHouseholds(households.length);
        setTotalNumberofFamilies(families.length);
        setTotalNumberofDeaths(deaths.length);
        // setTotalNumberofUsers(users.length);
        };

        fetchData();
    }, []);
    
    // Chart

    return (
        <>
            <Head>
                <title>VIMS - Dashboard</title>
                <meta
                name="description"
                content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
                />
            </Head>
            <Sidebar>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Dashboard
                        </h2>
                    </div>
                    <div className="flex mt-4 md:ml-4 md:mt-0">
                        <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                        Edit
                        </button>
                        <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                        >
                        Publish
                        </button>
                    </div>
                </div>
                <section className="grid gap-6 py-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative flex items-center p-8 bg-white rounded-lg shadow hover:bg-gray-100">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-blue-900 bg-blue-100 rounded-full">
                            <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                            >
                            <HomeIcon className="inline w-6 h-6 mr-2" />
                            </svg>
                        </div>
                        <div>
                            <span className="block text-2xl font-bold">{totalNumberofHouseholds}</span>
                            <span className="block text-gray-500">Total Households</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900" />
                    </div>

                    <div className="relative flex items-center p-8 bg-white rounded-lg shadow hover:bg-gray-100">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-blue-700 bg-blue-100 rounded-full">
                            <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                            >
                            <UserGroupIcon className="inline w-6 h-6 mr-2"></UserGroupIcon>
                            </svg>
                        </div>
                        <div>
                            <span className="block text-2xl font-bold">{totalNumberofFamilies}</span>
                            <span className="block text-gray-500">Total Families</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-700" />
                    </div>
                    
                    <div className="relative flex items-center p-8 bg-white rounded-lg shadow hover:bg-gray-100">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-blue-400 bg-blue-100 rounded-full">
                            <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                            >
                            <DocumentIcon className="inline w-6 h-6 mr-2"></DocumentIcon>
                            </svg>
                        </div>
                        <div>
                            <span className="inline-block text-2xl font-bold">{totalNumberofDeaths}</span>
                            <span className="block text-gray-500">Total Deaths</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400" />
                    </div>

                    <div className="relative flex items-center p-8 bg-white rounded-lg shadow hover:bg-gray-100">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mr-6 text-blue-400 bg-blue-100 rounded-full">
                            <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-6 h-6"
                            >
                            <UsersIcon className="inline w-6 h-6 mr-2" />
                            </svg>
                        </div>
                        <div>
                            <span className="block text-2xl font-bold">1</span>
                            <span className="block text-gray-500">Total Users</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-200" />
                    </div>

                </section>

                
            </Sidebar>
        
        </>
    )
}