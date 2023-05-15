import Head from 'next/head'
import Sidebar from '@/components/admin/layouts/Sidebar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect } from "react";


import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';


export default function FamilySearch() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();

    const [families, setFamilies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFamilies, setFilteredFamilies] = useState([]);
    
    useEffect(() => {
        fetchFamilies();
    }, []);

    const fetchFamilies = async () => {
        try {
          const { data: familiesData, error: familiesError } = await supabase
            .from('families')
            .select('*');
            
          if (familiesError) throw new Error(familiesError.message);
      
          const familiesWithLocationNames = await Promise.all(
            familiesData.map(async (family) => {
              try {
                const { data: householdsData, error: householdsError } = await supabase
                  .from('households')
                  .select(`
                    villages(name),
                    ward_village_tracts(name),
                    townships(name),
                    districts(name),
                    state_regions(name)
                    `)
                  .eq('household_no', family.household_no)
                  .single();
      
                if (householdsError) throw new Error(householdsError.message);
      
                const villageName = householdsData?.villages?.name || 'Unknown';
                const wardVillageTractName = householdsData?.ward_village_tracts?.name || 'Unknown';
                const townshipName = householdsData?.townships?.name || 'Unknown';
                const districtName = householdsData?.districts?.name || 'Unknown';
                const stateRegionName = householdsData?.state_regions?.name || 'Unknown';

                return { ...family, villageName, wardVillageTractName, townshipName, districtName, stateRegionName };
              } catch (error) {
                console.error(`Error fetching village name for household_no: ${family.household_no}`, error);
                return { ...family, 
                    villageName: 'Unknown',
                    wardVillageTractName: 'Unknown',
                    townshipName: 'Unknown',
                    districtName: 'Unknown',
                    stateRegionName: 'Unknown'  
                };
              }
            })
          );
      
          setFamilies(familiesWithLocationNames);
          setFilteredFamilies(familiesWithLocationNames);
        } catch (error) {
          console.error('Error fetching families:', error);
        }
    };
      

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        filterFamilies(e.target.value);
    };

    const filterFamilies = (searchTerm) => {
        const filtered = families.filter(
            (family) =>
            family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            family.nrc_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            family.household_no.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFamilies(filtered);
    };
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <>
            <Head>
                <title>TaxPal - Accounting made simple for small businesses</title>
                <meta
                name="description"
                content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
                />
            </Head>
            <Sidebar>
            <div>
                    <div>
                        <nav className="sm:hidden" aria-label="Back">
                        <a href="#" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ChevronLeftIcon className="flex-shrink-0 w-5 h-5 mr-1 -ml-1 text-gray-400" aria-hidden="true" />
                            Back
                        </a>
                        </nav>
                        <nav className="hidden sm:flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4">
                            <li>
                            <div className="flex">
                                <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                Admin
                                </a>
                            </div>
                            </li>
                            <li>
                            <div className="flex items-center">
                                <ChevronRightIcon className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <a href="#" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Deaths
                                </a>
                            </div>
                            </li>
                            <li>
                            <div className="flex items-center">
                                <ChevronRightIcon className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <a href="#" aria-current="page" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Index
                                </a>
                            </div>
                            </li>
                        </ol>
                        </nav>
                    </div>
                    <div className="mt-2 md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Households
                        </h2>
                        </div>
                    </div>
                </div>
                 
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flow-root mt-8">
                        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                            <input type="text" placeholder="Search families" value={searchTerm} onChange={handleSearch} className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" />
                            <div className="inline-block min-w-full py-2 align-middle">
                                
                                {filteredFamilies.length === 0 ? (
                                    <div>No families found.</div>
                                ) : (
                                <table className="min-w-full border-separate border-spacing-0">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                            >
                                                No
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                                            >
                                                NRC ID
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                                            >
                                                Date of Birth
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                            >
                                                Gender
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                            >
                                                Father Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                            >
                                                Address
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                                            >
                                                <span className="sr-only">Death Register</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFamilies.map((family, familyIdx) => (
                                        <tr key={family.id}>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                            )}
                                            >
                                            {familyIdx + 1}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                            )}
                                            >
                                            {family.name}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell'
                                            )}
                                            >
                                            {family.nrc_id}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                                            )}
                                            >
                                            {family.date_of_birth}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                            )}
                                            >
                                            {family.gender}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                            )}
                                            >
                                            {family.father_name}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-pre-line px-3 py-4 text-sm text-gray-500'
                                            )}
                                            >
                                            {`${family.villageName}\n${family.wardVillageTractName}\n${family.townshipName}, ${family.districtName},${family.stateRegionName}`}
                                            </td>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                                            )}
                                            >
                                            <a href="#" className="text-sky-600 hover:text-sky-900">
                                                Register<span className="sr-only">, {family.name}</span>
                                            </a>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        
        </>
    )
}