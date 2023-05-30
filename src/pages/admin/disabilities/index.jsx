import Head from 'next/head'
import Sidebar from '@/components/admin/layouts/Sidebar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect } from "react";
import { PlusCircleIcon } from '@heroicons/react/24/outline';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';
import { formatDate, classNames } from '/src/pages/utilities/tools.js';

export default function Disability() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [disabilities, setDisabilities] = useState([]);

    useEffect(() => {
        fetchDisabilities();
    }, []);

    const fetchDisabilities = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        
        const { data: disibilityData, error: disibilityError } = await supabase
          .from("disabilities")
          .select(`
            type_of_disabilities (name),
            description,
            families (name, date_of_birth, nrc_id, gender)
            
          `)
          .order("id", { ascending: false });
        
        if (disibilityError) {
          throw disibilityError;
        }
        setDisabilities(disibilityData);
        setIsLoading(false);
        return disibilityData;
    };
    
    const handleRegisterClick = () => {
        router.push('/admin/disabilities/register');
    };

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered disabilities based on search and filters
    const filteredDisabilities = disabilities.filter((disability) => {
        const isMatchingSearchQuery =
        // disability.type_of_disabilities.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // disability.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // disability.families.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // disability.families.date_of_birth.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // disability.families.nrc_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // disability.families.gender.toLowerCase().includes(searchQuery.toLowerCase())

        (disability.natype_of_disabilities.name && disability.type_of_disabilities.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (disability.description && disability.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (disability.families.name && disability.families.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (disability.families.date_of_birth && formatDate(disability.families.date_of_birth).startsWith(searchQuery)) ||
        (disability.families.nrc_id && disability.families.nrc_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (disability.families.gender && disability.families.gender.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
        isMatchingSearchQuery
        );
    });

    // Pagination Start
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage] = useState(10);
    const offset = currentPage * perPage;
    const currentPageData = filteredDisabilities.slice(offset, offset + perPage);
    const goToPreviousPage = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
    if (currentPage < Math.ceil(filteredDisabilities.length / perPage) - 1) {
        setCurrentPage(currentPage + 1);
    }
    };
    // Pagination End

    return (
        <>
            <Head>
                <title>VIMS - Disability</title>
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
                                    Disability
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
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Disabilities</h2>
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
                                            Type of Disability
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                        >
                                            Description
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
                                    <tr>
                                        <td className="py-4 pl-4 pr-3 text-lg">
                                            {isLoading && <p>Loading...</p>}
                                            {errorMessage && <p>{errorMessage}</p>}
                                        </td>
                                    </tr>
                                    
                                    {currentPageData.map((disability, disabilityIdx) => (
                                    <tr key={disabilityIdx} className='transition duration-300 ease-in-out border-b hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600'>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {(currentPage * perPage) + disabilityIdx + 1}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {disability.families.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {disability.families.gender}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {new Date(disability.families.date_of_birth).toLocaleDateString()}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                            {Math.floor(
                                            (new Date() - new Date(disability.families.date_of_birth)) /
                                                (365.25 * 24 * 60 * 60 * 1000)
                                            )}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {disability.families.nrc_id}
                                        </td>
                                        
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {disability.type_of_disabilities.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {disability.description}
                                        </td>
                                        <td
                                        className={classNames(
                                            disabilityIdx !== disability.length - 1 ? 'border-b border-gray-200' : '',
                                            'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                                        )}
                                        >
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                            Edit<span className="sr-only">, {disability.name}</span>
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
                                    <span className="font-medium">{filteredDisabilities.length}</span> results
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
                                    disabled={currentPage === Math.ceil(filteredDisabilities.length / perPage) - 1}
                                >
                                    Next
                                </button>
                                </div>
                            </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </Sidebar>
        
        </>
    )
}