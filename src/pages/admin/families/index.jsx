import Head from 'next/head'

import Sidebar from '@/components/admin/layouts/Sidebar'
import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';

export default function Family() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [families, setFamilies] = useState([]);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [relationships, setRelationships] = useState([]);
    const [selectedRelationship, setSelectedRelationship] = useState('');
    const [occupations, setOccupations] = useState([]);
    const [selectedOccupation, setSelectedOccupation] = useState('');
    const [educations, setEducations] = useState([]);
    const [selectedEducation, setSelectedEducation] = useState('');
    const [ethnicities, setEthnicities] = useState([]);
    const [selectedEthnicity, setSelectedEthnicity] = useState('');
    const [nationalities, setNationalities] = useState([]);
    const [selectedNationality, setSelectedNationality] = useState('');
    const [religions, setReligions] = useState([]);
    const [selectedReligion, setSelectedReligion] = useState('');
    const [households, setHouseholds] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState('');
    
    useEffect(() => {
        fetchFamilies();
        fetchEducation();
        fetchEthnicity();
        fetchHousehold();
        fetchNationality();
        fetchOccupation();
        fetchRelition();
        fetchRelationship();
    }, []);

    async function fetchFamilies() {
        setIsLoading(true);
        setErrorMessage(null);

        let { data: familyData, error } = await supabase
        .from('families').select(`
            id, 
            name, 
            date_of_birth,
            nrc_id,
            gender,
            father_name,
            mother_name,
            remark,
            relationships (id, name),
            occupations (id, name),
            educations (id, name),
            ethnicities (id, name),
            nationalities (id, name),
            religions (id, name),
            households (id, household_no),
            household_no
        `)
        .eq('isDeath', 'No')
        .order('household_no', { ascending: false });

        if (error) {
        setErrorMessage(error.message);
        } else {
        setFamilies(familyData);
        }

        setIsLoading(false);
    }

    function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
    }
    
    const handleAddClick = () => {
        router.push('/admin/families/add');
    };

    async function fetchRelationship() {
        try {
          const { data, error } = await supabase.from('relationships').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setRelationships(data);
        } catch (error) {
          console.log('Error fetching relationships:', error.message);
        }
    }

    async function fetchOccupation() {
        try {
          const { data, error } = await supabase.from('occupations').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setOccupations(data);
        } catch (error) {
          console.log('Error fetching occupations:', error.message);
        }
    }

    async function fetchEducation() {
        try {
          const { data, error } = await supabase.from('educations').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setEducations(data);
        } catch (error) {
          console.log('Error fetching educations:', error.message);
        }
    }

    async function fetchEthnicity() {
        try {
          const { data, error } = await supabase.from('ethnicities').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setEthnicities(data);
        } catch (error) {
          console.log('Error fetching ethnicities:', error.message);
        }
    }

    async function fetchNationality() {
        try {
          const { data, error } = await supabase.from('nationalities').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setNationalities(data);
        } catch (error) {
          console.log('Error fetching nationalities:', error.message);
        }
    }
    async function fetchRelition() {
        try {
          const { data, error } = await supabase.from('religions').select('id, name');
          if (error) {
            throw new Error(error.message);
          }
          setReligions(data);
        } catch (error) {
          console.log('Error fetching religions:', error.message);
        }
    }
    async function fetchHousehold() {
        try {
          const { data, error } = await supabase.from('households').select('id, household_no');
          if (error) {
            throw new Error(error.message);
          }
          setHouseholds(data);
        } catch (error) {
          console.log('Error fetching households:', error.message);
        }
    }

    // Filtered faimiles based on search and filters
    const filteredFamilies = families.filter((family) => {
        const isMatchingSearchQuery =
        family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.father_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.mother_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.remark.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.date_of_birth.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.nrc_id.toLowerCase().includes(searchQuery.toLowerCase()) ||

        family.occupations.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.educations.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.ethnicities.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.households.household_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.religions.name.toLowerCase().includes(searchQuery.toLowerCase());

        const isMatchingOccupation =
        selectedOccupation === '' || family.occupations.name === selectedOccupation;

        const isMatchingEducation =
        selectedEducation === '' || family.educations.name === selectedEducation;

        const isMatchingEthnicity =
        selectedEthnicity === '' ||
        family.ethnicities.name === selectedEthnicity;

        const isMatchingReligion = selectedReligion === '' || family.religions.name === selectedReligion;
        const isMatchingHousehold = selectedHousehold === '' || family.households.household_no === selectedHousehold;

        return (
        isMatchingSearchQuery &&
        isMatchingOccupation &&
        isMatchingEducation &&
        isMatchingEthnicity &&
        isMatchingReligion &&
        isMatchingHousehold
        );
    });

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
                        Families Index
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
                        Add Family
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

                        <select value={selectedOccupation} onChange={(e) => setSelectedOccupation(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                            <option value="">All - Occupations</option>
                            {/* Render Occupations options */}
                            {occupations.map((occupation) => (
                                <option key={occupation.id} value={occupation.name}>
                                {occupation.name}
                                </option>
                            ))}
                        </select>
                        <select value={selectedEducation} onChange={(e) => setSelectedEducation(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                            <option value="">All - Educations</option>
                            {/* Render Educations options */}
                            {educations.map((education) => (
                                <option key={education.id} value={education.name}>
                                {education.name}
                                </option>
                            ))}
                        </select>
                        <select value={selectedEthnicity} onChange={(e) => setSelectedEthnicity(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                            <option value="">All - Ethnicities</option>
                            {/* Render Ethnicities options */}
                            {ethnicities.map((ethnicity) => (
                                <option key={ethnicity.id} value={ethnicity.name}>
                                {ethnicity.name}
                                </option>
                            ))}
                        </select>
                        <select value={selectedReligion} onChange={(e) => setSelectedReligion(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                            <option value="">All - Religions</option>
                            {/* Render Religions options */}
                            {religions.map((religion) => (
                                <option key={religion.id} value={religion.name}>
                                {religion.name}
                                </option>
                            ))}
                        </select>
                        <select value={selectedHousehold} onChange={(e) => setSelectedHousehold(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                            <option value="">All - Household No</option>
                            {/* Render Religions options */}
                            {households.map((household) => (
                                <option key={household.id} value={household.household_no}>
                                {household.household_no}
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
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Household No
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
                                            DOB
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                                        >
                                            Age
                                        </th>
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            NRC ID
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
                                            Mother Name
                                        </th>  
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Relationship
                                        </th>   
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Occupation
                                        </th> 
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Education
                                        </th>  
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Ethnicity
                                        </th>   
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Ethnicity
                                        </th>  
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Nationality
                                        </th> 
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Religion
                                        </th> 
                                        <th
                                            scope="col"
                                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                                        >
                                            Remarks
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
                                    {currentPageData.map((family, familyIdx) => (
                                    <tr key={family.id}>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {(currentPage * perPage) + familyIdx + 1}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {family.household_no}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                        )}
                                        >
                                        {family.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell'
                                        )}
                                        >
                                        {new Date(family.date_of_birth).toLocaleDateString()}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell'
                                        )}
                                        >
                                        {Math.floor(
                                            (new Date() - new Date(family.date_of_birth)) /
                                                (365.25 * 24 * 60 * 60 * 1000)
                                            )}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                                        )}
                                        >
                                        {family.nrc_id}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                                        )}
                                        >
                                        {family.gender}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.father_name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.mother_name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.relationships.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.occupations.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.educations.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.ethnicities.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.nationalities.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.religions.name}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                                        )}
                                        >
                                        {family.remark}
                                        </td>
                                        <td
                                        className={classNames(
                                            familyIdx !== families.length - 1 ? 'border-b border-gray-200' : '',
                                            'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'
                                        )}
                                        >
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                            Edit<span className="sr-only">, {family.id}</span>
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
                        </div>
                    </div>
                </div>
            </Sidebar>
        
        </>
    )
}