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

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
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
                .select('*')
                .eq('isDeath', 'No');
    
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
            family.date_of_birth.toLowerCase().includes(searchTerm.toLowerCase()) ||
            family.household_no.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFamilies(filtered);
    };
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }


    const [selectedFamily, setSelectedFamily] = useState(null);
    const [deathDate, setDeathDate] = useState('');
    const [deathPlace, setDeathPlace] = useState('');
    const [complainant, setComplainant] = useState('');
    const [remark, setRemark] = useState('');
      
    function handleRegistrationClick(familyId) {
        const selectedFamily = filteredFamilies.find(family => family.id === familyId);
        setSelectedFamily(selectedFamily);
        // Open the modal here (implementation depends on your specific modal component)
    }

    const handleRegister = async (e) => {
        e.preventDefault();

        const { data: deathData, error: deathError } = await supabase
        .from("deaths")
        .insert([
        {
            death_date: deathDate,
            death_place: deathPlace,
            complainant: complainant,
            remark: remark,
            family_id: selectedFamily.id
        },
        ]);
        
        // Update isDeath to 'Yes' in families table
        const { data: updateData, error: updateError } = await supabase
        .from("families")
        .update({ isDeath: 'Yes' })
        .eq('id', selectedFamily.id);

        if (updateError) {
        throw updateError;
        }
        
        if (deathError) {
            throw deathError;
        }
        
        setSelectedFamily(null)
        fetchFamilies();
        router.push('/admin/deaths');
        console.log(deathData);
        console.log(updateData);
    };

    // Pagination Start
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage] = useState(10);
    const offset = currentPage * perPage;
    const currentPageData = filteredFamilies.slice(offset, offset + perPage);
    const goToPreviousPage = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredFamilies.length / perPage) - 1) {
        setCurrentPage(currentPage + 1);
    }
    };
    // Pagination End

    return (
        <>
            <Head>
                <title>VIMS - Death Register</title>
                <meta
                name="description"
                content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
                />
            </Head>
            <Sidebar>
            <div className="px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs Start */}
                    <div className='py-2'>
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
                                    Death
                                    </a>
                                </div>
                                </li>
                                <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                                    <a href="#" aria-current="page" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    Show All
                                    </a>
                                </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    {/* Breadcrumbs End */}
                    
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Deaths</h2>
                            <p className="mt-2 text-sm text-gray-700">
                                A list of all the users in your account including their name, title, email and role.
                            </p>
                        </div>
                        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                            <button
                                type="button"
                                onClick={handleRegisterClick}
                                className="flex items-center justify-center px-2 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                            <PlusCircleIcon className="w-8 h-8 mr-2" />
                            Go To Register
                            </button>
                        </div>
                    </div>
                    <div className="flow-root mt-8">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-3">
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
                            
                        </div>
                        
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                
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
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Gender
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            DOB
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Age
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            NRC
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Death Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Death Place
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Complainant
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Remark
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
                                    {isLoading && <p>Loading...</p>}
                                    {errorMessage && <p>{errorMessage}</p>}
                                    
                                    {currentPageData.map((death, deathIdx) => (
                                    <tr key={death.id}>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {(currentPage * perPage) + deathIdx + 1}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.families.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.families.gender}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {new Date(death.families.date_of_birth).toLocaleDateString()}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                            {Math.floor(
                                            (new Date() - new Date(death.families.date_of_birth)) /
                                                (365.25 * 24 * 60 * 60 * 1000)
                                            )}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.families.nrc_id}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {new Date(death.death_date).toLocaleDateString()}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.death_place}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.complainant}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {death.remark}
                                        </td>
                                        <td
                                        className={classNames(
                                            deathIdx !== deaths.length - 1 ? 'border-b border-gray-200' : '',
                                            'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                                        )}
                                        >
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                            Edit<span className="sr-only">, {death.name}</span>
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
                                    <span className="font-medium">{filteredDeaths.length}</span> results
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
                                    disabled={currentPage === Math.ceil(filteredDeaths.length / perPage) - 1}
                                >
                                    Next
                                </button>
                                </div>
                            </nav>
                            </div>
                        </div>
                    </div>
                </div>

                
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
                                    Register
                                    </a>
                                </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className="mt-2 md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Death Registration
                            </h2>
                        </div>
                        <div className="relative flex items-center mt-2">
                            <input
                            type="text"
                            name="search"
                            id="search"
                            placeholder="Search"
                            value={searchTerm} 
                            onChange={handleSearch} 
                            className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                                <kbd className="inline-flex items-center px-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
                                    ⌘K
                                </kbd>
                            </div>
                           
                        </div>
                    </div>
                </div>
                 
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flow-root mt-8">
                        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle">
                                
                                {filteredFamilies.length === 0 ? (
                                    <div>No data!</div>
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
                                        {isLoading && <p>Loading...</p>}
                                        {errorMessage && <p>{errorMessage}</p>}

                                        {currentPageData.map((family, familyIdx) => (
                                        <tr key={family.id}>
                                            <td
                                            className={classNames(
                                                familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                                'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                            )}
                                            >
                                            {(currentPage * perPage) + familyIdx + 1}
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
                                                {new Date(family.date_of_birth).toLocaleDateString()}
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
                                            <a href="#" onClick={() => handleRegistrationClick(family.id)} className="text-sky-600 hover:text-sky-900">
                                                Register<span className="sr-only">, {family.name}</span>
                                            </a>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                )}
                                {/* Pagination */}
                                <nav className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6" aria-label="Pagination">
                                    <div className="hidden sm:block">
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{offset + 1}</span> to{' '}
                                        <span className="font-medium">{offset + currentPageData.length}</span> of{' '}
                                        <span className="font-medium">{filteredFamilies.length}</span> results
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
                                        disabled={currentPage === Math.ceil(filteredFamilies.length / perPage) - 1}
                                    >
                                        Next
                                    </button>
                                    </div>
                                </nav>
                                
                                <form onSubmit={handleRegister}>
                                    {selectedFamily && (
                                    <Modal onClose={() => setSelectedFamily(null)}>
                                        <div className="grid max-w-4xl grid-cols-1 px-6 py-4 mx-auto gap-x-4 gap-y-8 sm:grid-cols-1">
                                            <div className="sm:col-span-4">
                                                <div className="text-lg font-bold">Register Death Form</div>
                                                <hr className="my-2 border-gray-300" />
                                                <p>Death Date: {selectedFamily.name}</p>
                                                <p>Date of Birth: {selectedFamily.date_of_birth}</p>
                                                <p>Gender: {selectedFamily.gender}</p>
                                                <p>NRC ID: {selectedFamily.nrc_id}</p>
                                            </div>
                                            <div className="sm:col-span-4">
                                                <input
                                                type="date"
                                                placeholder="Death Date"
                                                value={deathDate}
                                                onChange={(e) => setDeathDate(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            <div className="sm:col-span-4">
                                                <input
                                                type="text"
                                                placeholder="Death Place"
                                                value={deathPlace}
                                                onChange={(e) => setDeathPlace(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            <div className="sm:col-span-4">
                                                <input
                                                type="text"
                                                placeholder="Complainant"
                                                value={complainant}
                                                onChange={(e) => setComplainant(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            <div className="sm:col-span-4">
                                                <textarea
                                                    id="about"
                                                    placeholder="Remarks"
                                                    value={remark}
                                                    onChange={(e) => setRemark(e.target.value)}
                                                    rows={3}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            
                                            <div className="flex justify-between sm:col-span-4">
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                                                >
                                                    Register
                                                </button>
                                                <button
                                                    className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700"
                                                    onClick={() => setSelectedFamily(null)}
                                                >
                                                    Close
                                                </button>
                                            </div>

                                        </div>
                                    </Modal>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        
        </>
    )
}

const Modal = ({ children }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-800 opacity-75"></div>
        <div className="z-50 max-w-4xl p-6 mx-auto bg-white rounded-lg">
          {children}
        </div>
      </div>
    );
};
  