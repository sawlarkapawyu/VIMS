import Head from 'next/head'
import Sidebar from '@/components/admin/layouts/Sidebar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import React, { useState, useEffect } from "react";


import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';

export default function HouseholdAdd() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();

    const [entryDate, setEntryDate] = useState('');
    const [householdId, setHouseholdId] = useState('');
    const [houseNo, setHouseNo] = useState('');
    const [familyHead, setFamilyHead] = useState('');

    const [stateRegions, setStateRegions] = useState([]);
    const [selectedStateRegion, setSelectedStateRegion] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [townships, setTownships] = useState([]);
    const [selectedTownship, setSelectedTownship] = useState(null);
    const [wardVillageTracts, setWardVillageTracts] = useState([]);
    const [selectedWardVillageTract, setSelectedWardVillageTract] = useState(null);
    const [villages, setVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState("");

    useEffect(() => {
        fetchStateRegions();
        fetchDistricts();
        fetchTownships();
        fetchWardVillageTracts();
        fetchVillages();
    }, []);

    const fetchStateRegions = async () => {
        try {
            const { data: stateRegions, error } = await supabase
            .from("state_regions")
            .select("*");
          if (error) throw error;
          setStateRegions(stateRegions);
        } catch (error) {
          console.log("error", error);
        }
    };

    const fetchDistricts = async () => {
        try {
            const { data: districts, error } = await supabase
            .from("districts")
            .select("*")
            .eq("stateregion_id", selectedStateRegion.id);
          if (error) throw error;
          setDistricts(districts);
        } catch (error) {
          console.log("error", error);
        }
    };

    const fetchTownships = async () => {
        try {
            const { data: townships, error } = await supabase
            .from("townships")
            .select("*")
            .eq("district_id", selectedDistrict.id);
          if (error) throw error;
          setTownships(townships);
        } catch (error) {
          console.log("error", error);
        }
    };

    const fetchWardVillageTracts = async () => {
        try {
            const { data: wardVillageTracts, error } = await supabase
            .from("ward_village_tracts")
            .select("*")
            .eq("township_id", selectedTownship.id);
          if (error) throw error;
          setWardVillageTracts(wardVillageTracts);
        } catch (error) {
          console.log("error", error);
        }
    };

    const fetchVillages = async () => {
        try {
            const { data: villages, error } = await supabase
            .from("villages")
            .select("*")
            .eq("wardvillagetract_id", selectedWardVillageTract.id);
          if (error) throw error;
          setVillages(villages);
        } catch (error) {
          console.log("error", error);
        }
    };

    const handleStateRegionChange = async (event) => {
        const selectedStateRegion = stateRegions.find(
          (sr) => sr.id === parseInt(event.target.value)
        );
        setSelectedStateRegion(selectedStateRegion);
        setSelectedDistrict(null);
        setSelectedTownship(null);
        setSelectedWardVillageTract(null);
        setDistricts([]);
        setTownships([]);
        setWardVillageTracts([]);
        setVillages([]);
        try {
          const { data: districts, error } = await supabase
            .from("districts")
            .select("*")
            .eq("state_region_id", selectedStateRegion.id);
          console.log("districts", districts);
          if (error) throw error;
          setDistricts(districts);
        } catch (error) {
          console.log("error", error);
        }
    };

    const handleDistrictChange = async (event) => {
        const selectedDistrict = districts.find(
            (d) => d.id === parseInt(event.target.value));
            setSelectedDistrict(selectedDistrict);
            setSelectedTownship(null);
            setSelectedWardVillageTract(null);
            setTownships([]);
            setWardVillageTracts([]);
            setVillages([]);
            
        try {
            const { data: townshipsData } = await supabase
            .from('townships')
            .select('*')
            .eq('district_id', selectedDistrict.id)
            .order('name', { ascending: true });
            if (townshipsData && townshipsData.length > 0) {
                setTownships(townshipsData);
            }
        } catch (error) {
        console.log('Error fetching townships', error);
        }
    }

    const handleTownshipChange = async (event) => {
        const selectedTownship = townships.find(
            (t) => t.id === parseInt(event.target.value));
            setSelectedTownship(selectedTownship);
            setSelectedWardVillageTract(null);
            setWardVillageTracts([]);
            setVillages([]);
            
            try {
            const { data: wardVillageTractsData } = await supabase
            .from('ward_village_tracts')
            .select('*')
            .eq('township_id', selectedTownship.id)
            .order('name', { ascending: true });
            if (wardVillageTractsData && wardVillageTractsData.length > 0) {
                setWardVillageTracts(wardVillageTractsData);
            }
        } catch (error) {
        console.log('Error fetching ward village tracts', error);
        }
    }

    const handleWardVillageTractChange = async (event) => {
        const selectedWardVillageTract = wardVillageTracts.find(
            (wv) => wv.id === parseInt(event.target.value));
            setSelectedWardVillageTract(selectedWardVillageTract);
            setVillages([]);
            
            try {
            const { data: villagesData } = await supabase
            .from('villages')
            .select('*')
            .eq('ward_village_tract_id', selectedWardVillageTract.id)
            .order('name', { ascending: true });
            if (villagesData && villagesData.length > 0) {
                setVillages(villagesData);
            }
        } catch (error) {
        console.log('Error fetching villages', error);
        }
    }

    const handleVillageChange = (event) => {
        setSelectedVillage(event.target.value);
    };
      

    // Handle create household
    const handleCreateHousehold = async (e) => {
        e.preventDefault();
        
        // Check if all required fields are filled
        if (!entryDate || !householdId || !houseNo || !familyHead || !selectedStateRegion || !selectedDistrict || !selectedTownship || !selectedWardVillageTract || !selectedVillage) {
            alert("Please fill all required fields!");
            return;
        }
        
        const { data: householdData, error: householdError } = await supabase
        .from("households")
        .insert([
        {
            entry_date: entryDate,
            household_no: householdId,
            house_no: houseNo,
            family_head: familyHead,
            state_region_id: selectedStateRegion.id,
            district_id: selectedDistrict.id,
            township_id: selectedTownship.id,
            ward_village_tract_id: selectedWardVillageTract.id,
            village_id: selectedVillage
        },
        ]);

    if (householdError) {
        throw householdError;
    }

    router.push('/admin/households');
    console.log(householdData);
    };


    const handleBackClick = () => {
        router.push('/admin/households');
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
                                Househlods
                                </a>
                            </div>
                            </li>
                            <li>
                            <div className="flex items-center">
                                <ChevronRightIcon className="flex-shrink-0 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <a href="#" aria-current="page" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                Add
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
                        <div className="flex flex-shrink-0 mt-4 md:ml-4 md:mt-0">
                        {/* <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Edit
                        </button> */}
                        <button
                            type="button"
                            onClick={handleBackClick}
                            className="inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                        >
                            Go to Index
                        </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 pt-10 gap-x-8 gap-y-8 md:grid-cols-3">
                    <div className="px-4 sm:px-0">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">Household Information</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p>
                    </div>

                    <form onSubmit={handleCreateHousehold} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="householdId" className="block text-sm font-medium leading-6 text-gray-900">
                                    Household No
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            id="householdId"
                                            value={householdId}
                                            onChange={(e) => setHouseholdId(e.target.value)}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="entryDate" className="block text-sm font-medium leading-6 text-gray-900">
                                    Entry Date
                                    </label>
                                    <div className="mt-2">
                                    <input
                                        type="date"
                                        id="entryDate"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                    />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="houseNo" className="block text-sm font-medium leading-6 text-gray-900">
                                    House Number
                                    </label>
                                    <div className="mt-2">
                                    <input
                                        type="text"
                                        id="houseNo"
                                        value={houseNo}
                                        onChange={(e) => setHouseNo(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                    />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label htmlFor="familyHead" className="block text-sm font-medium leading-6 text-gray-900">
                                    Family Head
                                    </label>
                                    <div className="mt-2">
                                    <input
                                        type="text"
                                        id="familyHead"
                                        value={familyHead}
                                        onChange={(e) => setFamilyHead(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                    />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="stateRegions" className="block text-sm font-medium leading-6 text-gray-900">
                                    State/Regions
                                    </label>
                                    <div className="mt-2">
                                        <select 
                                            id="stateRegions"
                                            value={selectedStateRegion ? selectedStateRegion.id : ""}
                                            onChange={handleStateRegionChange} 
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                            <option value="">Select state/region</option>
                                            {stateRegions.map((sr) => (
                                            <option key={sr.id} value={sr.id}>
                                                {sr.name}
                                            </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="sm:col-span-3">
                                    <label htmlFor="districts" className="block text-sm font-medium leading-6 text-gray-900">
                                    Districts
                                    </label>
                                    <div className="mt-2">
                                        <select 
                                            id="districts"
                                            value={selectedDistrict ? selectedDistrict.id :"" }
                                            onChange={handleDistrictChange} 
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                            <option value="">Select district</option>
                                            {districts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="townships" className="block text-sm font-medium leading-6 text-gray-900">
                                    Townships
                                    </label>
                                    <div className="mt-2">
                                        <select 
                                            id="townships"
                                            value={selectedTownship ? selectedDistrict.id: ""}
                                            onChange={handleTownshipChange} 
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                            <option value="">Select township</option>
                                            {townships.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="wardVillageTracts" className="block text-sm font-medium leading-6 text-gray-900">
                                    Ward/Village Tracts
                                    </label>
                                    <div className="mt-2">
                                        <select 
                                            id="wardVillageTracts"
                                            value={selectedWardVillageTract ? selectedWardVillageTract.id : ""}
                                            onChange={handleWardVillageTractChange} 
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                            <option value="">Select ward/village tract</option>
                                            {wardVillageTracts.map((wvt) => (
                                            <option key={wvt.id} value={wvt.id}>
                                                {wvt.name}
                                            </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="selectedVillage" className="block text-sm font-medium leading-6 text-gray-900">
                                    Villages
                                    </label>
                                    <div className="mt-2">
                                        <select 
                                            id="selectedVillage"
                                            value={selectedVillage}
                                            onChange={handleVillageChange} 
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6">
                                            <option value="">Select village</option>
                                            {villages.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end px-4 py-4 border-t gap-x-6 border-gray-900/10 sm:px-8">
                            <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                            Cancel
                            </button>
                            <button
                            type="submit"
                            className="px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                            Submit
                            </button>
                        </div>  
                    </form>
                </div>
            </Sidebar>
        
        </>
    )
}