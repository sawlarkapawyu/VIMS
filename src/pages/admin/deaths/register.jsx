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
        console.log(deathData);
    };

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
                            Death Registration Form
                        </h2>
                        </div>
                        <div className="flex flex-shrink-0 mt-4 w-30 md:ml-4 md:mt-0">
                            <input 
                                type="text" 
                                placeholder="Search families" 
                                value={searchTerm} 
                                onChange={handleSearch} 
                                className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                </div>
                 
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flow-root mt-8">
                        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle">
                                
                                {filteredFamilies.length === 0 ? (
                                    <div>Loading!</div>
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

                                <form onSubmit={handleRegister}>
                                    {selectedFamily && (
                                    <Modal onClose={() => setSelectedFamily(null)}>
                                        <div className="grid max-w-4xl grid-cols-1 px-6 py-4 gap-x-6 gap-y-8 sm:grid-cols-6">
                                            <div className="sm:col-span-6">
                                                <div className="text-lg font-bold">Register Death Form</div>
                                                <hr className="my-2 border-gray-300" />
                                                <p>Death Date: {selectedFamily.name}</p>
                                                <p>Date of Birth: {selectedFamily.date_of_birth}</p>
                                                <p>Gender: {selectedFamily.gender}</p>
                                                <p>NRC ID: {selectedFamily.nrc_id}</p>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <input
                                                type="date"
                                                placeholder="Death Date"
                                                value={deathDate}
                                                onChange={(e) => setDeathDate(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            <div className="sm:col-span-6">
                                                <input
                                                type="text"
                                                placeholder="Death Place"
                                                value={deathPlace}
                                                onChange={(e) => setDeathPlace(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            <div className="sm:col-span-6">
                                                <input
                                                type="text"
                                                placeholder="Complainant"
                                                value={complainant}
                                                onChange={(e) => setComplainant(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            <div className="sm:col-span-6">
                                                <textarea
                                                    id="about"
                                                    placeholder="Remarks"
                                                    value={remark}
                                                    onChange={(e) => setRemark(e.target.value)}
                                                    rows={3}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            
                                            <div className="flex justify-between sm:col-span-6">
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
        <div className="z-50 max-w-3xl p-6 mx-auto bg-white rounded-lg">
          {children}
        </div>
      </div>
    );
};