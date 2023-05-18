import Head from 'next/head'


import { Header } from '@/components/Header'
import Sidebar from '@/components/admin/layouts/Sidebar'
import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import ReactPaginate from 'react-paginate';

export default function Household() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [households, setHouseholds] = useState([]);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [stateRegions, setStateRegions] = useState([]);
    const [selectedStateRegion, setSelectedStateRegion] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [townships, setTownships] = useState([]);
    const [selectedTownship, setSelectedTownship] = useState('');
    const [wardVillageTracts, setWardVillageTracts] = useState([]);
    const [selectedWardVillageTract, setSelectedWardVillageTract] = useState('');
    const [villages, setVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState('');
    
    useEffect(() => {
        fetchHouseholds();
        fetchStateRegions();
        fetchDistricts();
        fetchTownships();
        fetchWardVillageTracts();
        fetchVillages();
    }, []);

    async function fetchHouseholds() {
        setIsLoading(true);
        setErrorMessage(null);

        let { data: househlodData, error } = await supabase
        .from('households').select(`
            id, 
            household_no, 
            entry_date,
            family_head,
            house_no,
            state_regions (id, name),
            districts (id, name),
            townships (id, name),
            ward_village_tracts (id, name),
            villages (id, name)
        `)
        .order('household_no', { ascending: false });

        // Simulating a delay of 1 second
        setTimeout(() => {
            setHouseholds(househlodData);
        }, 1000);

        if (error) {
        setErrorMessage(error.message);
        } else {
        setHouseholds(househlodData);
        }

        setIsLoading(false);
    }

    async function fetchStateRegions() {
        try {
          const { data, error } = await supabase.from('state_regions').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setStateRegions(data);
        } catch (error) {
          console.log('Error fetching state regions:', error.message);
        }
    }

    async function fetchDistricts() {
        try {
          const { data, error } = await supabase.from('districts').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setDistricts(data);
        } catch (error) {
          console.log('Error fetching districts:', error.message);
        }
    }

    async function fetchTownships() {
        try {
          const { data, error } = await supabase.from('townships').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setTownships(data);
        } catch (error) {
          console.log('Error fetching townships:', error.message);
        }
    }

    async function fetchWardVillageTracts() {
        try {
          const { data, error } = await supabase.from('ward_village_tracts').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setWardVillageTracts(data);
        } catch (error) {
          console.log('Error fetching ward village tracts:', error.message);
        }
    }

    async function fetchVillages() {
        try {
          const { data, error } = await supabase.from('villages').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setVillages(data);
        } catch (error) {
          console.log('Error fetching villages:', error.message);
        }
    }
    
    
    // Filtered households based on search and filters
    const filteredHouseholds = households.filter((household) => {
        const isMatchingSearchQuery =
        household.household_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.entry_date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.house_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.family_head.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.state_regions.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.districts.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.townships.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.ward_village_tracts.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        household.villages.name.toLowerCase().includes(searchQuery.toLowerCase());

        const isMatchingStateRegion =
        selectedStateRegion === '' || household.state_regions.name === selectedStateRegion;

        const isMatchingDistrict =
        selectedDistrict === '' || household.districts.name === selectedDistrict;

        const isMatchingTownship =
        selectedTownship === '' || household.townships.name === selectedTownship;

        const isMatchingWardVillageTract =
        selectedWardVillageTract === '' ||
        household.ward_village_tracts.name === selectedWardVillageTract;

        const isMatchingVillage = selectedVillage === '' || household.villages.name === selectedVillage;

        return (
        isMatchingSearchQuery &&
        isMatchingStateRegion &&
        isMatchingDistrict &&
        isMatchingTownship &&
        isMatchingWardVillageTract &&
        isMatchingVillage
        );
    });
    
    function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
    }
    
    const handleAddClick = () => {
        router.push('/admin/households/add');
    };

    // Pagination Start
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage] = useState(10);
    const offset = currentPage * perPage;
    const currentPageData = filteredHouseholds.slice(offset, offset + perPage);
    const goToPreviousPage = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredHouseholds.length / perPage) - 1) {
        setCurrentPage(currentPage + 1);
    }
    };
    // Pagination End
    
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
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Household Index
                        </h2>
                    </div>
                    <div className="flex mt-4 md:ml-4 md:mt-0">
                        {/* <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                        Edit
                        </button> */}
                        <button
                        type="button"
                        onClick={handleAddClick}
                        className="inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                        >
                        Add Household
                        </button>
                    </div>
                </div>
                <div className="flow-root mt-8">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridGap: '10px' }} className='py-2'>
                        <div className="relative flex items-center mt-2">
                            <input
                            type="text"
                            name="search"
                            id="search"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                                <kbd className="inline-flex items-center px-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
                                    ⌘K
                                </kbd>
                            </div>
                        </div>

                        <select value={selectedStateRegion} onChange={(e) => setSelectedStateRegion(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - State/Regions</option>
                        {/* Render state region options */}
                        {stateRegions.map((stateRegion) => (
                            <option key={stateRegion.id} value={stateRegion.name}>
                            {stateRegion.name}
                            </option>
                        ))}
                        </select>
                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Districts</option>
                        {/* Render district options */}
                        {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                            {district.name}
                            </option>
                        ))}
                        </select>
                        <select value={selectedTownship} onChange={(e) => setSelectedTownship(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Townships</option>
                        {/* Render township options */}
                        {townships.map((township) => (
                            <option key={township.id} value={township.name}>
                            {township.name}
                            </option>
                        ))}
                        </select>
                        <select value={selectedWardVillageTract} onChange={(e) => setSelectedWardVillageTract(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Ward/Village Tracts</option>
                        {/* Render ward/village tract options */}
                        {wardVillageTracts.map((wardVillageTract) => (
                            <option key={wardVillageTract.id} value={wardVillageTract.name}>
                            {wardVillageTract.name}
                            </option>
                        ))}
                        </select>
                        <select value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All- Villages</option>
                        {/* Render village options */}
                        {villages.map((village) => (
                            <option key={village.id} value={village.name}>
                            {village.name}
                            </option>
                        ))}
                        </select>
                    </div>
                    <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle">
                            {isLoading && <p>Loading...</p>}
                            {errorMessage && <p>{errorMessage}</p>}
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
                                            Household No
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
                                        >
                                            Entry Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                                        >
                                            Family Head
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            House No
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Village
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Ward/Village Tract
                                        </th> 
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Township
                                        </th>  
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            District
                                        </th>   
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            State/Region
                                        </th>     
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                                        >
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageData.map((household, householdIdx) => (
                                    <tr key={household.id}>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {(currentPage * perPage) + householdIdx + 1}
                                        {/* {householdIdx + 1} */}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {household.household_no}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell'
                                        )}
                                        >
                                        {new Date(household.entry_date).toLocaleDateString()}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                                        )}
                                        >
                                        {household.family_head}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.house_no}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.villages.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.ward_village_tracts.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.townships.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.districts.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {household.state_regions.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            householdIdx !== households.length - 1 ? 'border-b border-gray-200' : '',
                                            'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                                        )}
                                        >
                                        <a href="#" className="text-sky-600 hover:text-sky-900">
                                            Edit<span className="sr-only">, {household.id}</span>
                                        </a>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <nav className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6" aria-label="Pagination">
                                <div className="hidden sm:block">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{offset + 1}</span> to{' '}
                                    <span className="font-medium">{offset + currentPageData.length}</span> of{' '}
                                    <span className="font-medium">{filteredHouseholds.length}</span> results
                                </p>
                                </div>
                                <div className="flex justify-between flex-1 sm:justify-end">
                                <button
                                    onClick={goToPreviousPage}
                                    className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                                    disabled={currentPage === 0}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={goToNextPage}
                                    className="relative inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                                    disabled={currentPage === Math.ceil(filteredHouseholds.length / perPage) - 1}
                                >
                                    Next
                                </button>
                                </div>
                            </nav>
                            
                            {/* <ReactPaginate
                                previousLabel="Previous"
                                nextLabel="Next"
                                breakLabel="..."
                                breakClassName="break-me"
                                pageCount={Math.ceil(households.length / perPage)}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageChange}
                                containerClassName="pagination"
                                activeClassName="active"
                            /> */}
                        </div>
                    </div>
                </div>
            </Sidebar>
        
        </>
    )
}