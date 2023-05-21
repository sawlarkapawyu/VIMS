import { GridFilterListIcon } from '@mui/x-data-grid';
import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router';

const Table = () => {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [families, setFamilies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [genders, setGenders] = useState([]);
    const [selectedGender, setSelectedGender] = useState('');
    const [households, setHouseholds] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState('');
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

    const [occupations, setOccupations] = useState([]);
    const [selectedOccupation, setSelectedOccupation] = useState('');
    const [educations, setEducations] = useState([]);
    const [selectedEducation, setSelectedEducation] = useState('');
    const [ethnicities, setEthnicities] = useState([]);
    const [selectedEthnicity, setSelectedEthnicity] = useState('');
    const [religions, setReligions] = useState([]);
    const [selectedReligion, setSelectedReligion] = useState('');
    const [deaths, setDeaths] = useState([]);
    const [selectedDeath, setSelectedDeath] = useState('');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    useEffect(() => {
        fetchFamilies();
      }, [selectedDeath, minAge, maxAge]);

    const fetchFamilies = async () => {
        if (selectedDeath === '') {
            try {
                const { data: familiesData, error: familiesError } = await supabase
                    .from('families').select(`
                    id, 
                    name, 
                    date_of_birth,
                    nrc_id,
                    gender,
                    father_name,
                    mother_name,
                    remark,
                    isDeath,
                    relationships (id, name),
                    occupations (id, name),
                    educations (id, name),
                    ethnicities (id, name),
                    nationalities (id, name),
                    religions (id, name),
                    households (id, household_no),
                    household_no
                    `)
                    .eq('isDeath', 'No');
            
                if (familiesError) throw new Error(familiesError.message);
                
                const familiesWithLocationNames = await Promise.all(
                    familiesData.map(async (family) => {
                    try {
                        const { data: householdsData, error: householdsError } = await supabase
                        .from('households')
                        .select(`
                            entry_date,
                            house_no,
                            household_no,
                            family_head,
                            villages(name),
                            ward_village_tracts(name),
                            townships(name),
                            districts(name),
                            state_regions(name)
                        `)
                        .eq('household_no', family.household_no);
            
                        if (householdsError) throw new Error(householdsError.message);
                        
                        const entryDate = householdsData[0]?.entry_date || 'Unknown';
                        const houseNo = householdsData[0]?.house_no || 'Unknown';
                        const householdNo = householdsData[0]?.household_no || 'Unknown';
                        const familyHead = householdsData[0]?.family_head || 'Unknown';
                        const villageName = householdsData[0]?.villages?.name || 'Unknown';
                        const wardVillageTractName = householdsData[0]?.ward_village_tracts?.name || 'Unknown';
                        const townshipName = householdsData[0]?.townships?.name || 'Unknown';
                        const districtName = householdsData[0]?.districts?.name || 'Unknown';
                        const stateRegionName = householdsData[0]?.state_regions?.name || 'Unknown';
                        
                        return {
                        ...family,
                        entryDate,
                        houseNo,
                        householdNo,
                        familyHead,
                        villageName,
                        wardVillageTractName,
                        townshipName,
                        districtName,
                        stateRegionName,
                        };
                    } catch (error) {
                        console.error(`Error fetching village name for household_no: ${family.household_no}`, error);
                        return {
                        ...family,
                        householdNo: 'Unknown',
                        entryDate: 'Unknown',
                        houseNo: 'Unknown',
                        familyHead: 'Unknown',
                        villageName: 'Unknown',
                        wardVillageTractName: 'Unknown',
                        townshipName: 'Unknown',
                        districtName: 'Unknown',
                        stateRegionName: 'Unknown',
                        };
                    }
                    })
                );
        
                setFamilies(familiesWithLocationNames);
            } catch (error) {
                console.error('Error fetching families:', error);
            }
        }
        else {
            try {
                const { data: familiesData, error: familiesError } = await supabase
                    .from('families').select(`
                    id, 
                    name, 
                    date_of_birth,
                    nrc_id,
                    gender,
                    father_name,
                    mother_name,
                    remark,
                    isDeath,
                    relationships (id, name),
                    occupations (id, name),
                    educations (id, name),
                    ethnicities (id, name),
                    nationalities (id, name),
                    religions (id, name),
                    households (id, household_no),
                    household_no
                    `)
                    .eq('isDeath', selectedDeath);
            
                if (familiesError) throw new Error(familiesError.message);
                
                const familiesWithLocationNames = await Promise.all(
                    familiesData.map(async (family) => {
                    try {
                        const { data: householdsData, error: householdsError } = await supabase
                        .from('households')
                        .select(`
                            entry_date,
                            house_no,
                            household_no,
                            family_head,
                            villages(name),
                            ward_village_tracts(name),
                            townships(name),
                            districts(name),
                            state_regions(name)
                        `)
                        .eq('household_no', family.household_no);
            
                        if (householdsError) throw new Error(householdsError.message);
                        
                        const entryDate = householdsData[0]?.entry_date || 'Unknown';
                        const houseNo = householdsData[0]?.house_no || 'Unknown';
                        const householdNo = householdsData[0]?.household_no || 'Unknown';
                        const familyHead = householdsData[0]?.family_head || 'Unknown';
                        const villageName = householdsData[0]?.villages?.name || 'Unknown';
                        const wardVillageTractName = householdsData[0]?.ward_village_tracts?.name || 'Unknown';
                        const townshipName = householdsData[0]?.townships?.name || 'Unknown';
                        const districtName = householdsData[0]?.districts?.name || 'Unknown';
                        const stateRegionName = householdsData[0]?.state_regions?.name || 'Unknown';
                        
                        return {
                        ...family,
                        entryDate,
                        houseNo,
                        householdNo,
                        familyHead,
                        villageName,
                        wardVillageTractName,
                        townshipName,
                        districtName,
                        stateRegionName,
                        };
                    } catch (error) {
                        console.error(`Error fetching village name for household_no: ${family.household_no}`, error);
                        return {
                        ...family,
                        householdNo: 'Unknown',
                        entryDate: 'Unknown',
                        houseNo: 'Unknown',
                        familyHead: 'Unknown',
                        villageName: 'Unknown',
                        wardVillageTractName: 'Unknown',
                        townshipName: 'Unknown',
                        districtName: 'Unknown',
                        stateRegionName: 'Unknown',
                        };
                    }
                    })
                );
        
                setFamilies(familiesWithLocationNames);
            } catch (error) {
                console.error('Error fetching families:', error);
            }
        }
    };
    
    // Function to check if the age matches the selected age filter
    const checkAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const isMatchingAge =
          (minAge === '' || age >= minAge) && (maxAge === '' || age <= maxAge);
    
        return isMatchingAge;
    };
    const handleMinAgeChange = (e) => {
        const inputMinAge = e.target.value !== '' ? parseInt(e.target.value) : '';
        setMinAge(inputMinAge);
    };
    const handleMaxAgeChange = (e) => {
        const inputMaxAge = e.target.value !== '' ? parseInt(e.target.value) : '';
        setMaxAge(inputMaxAge);
    };
    
    
    // Filtered faimiles based on search and filters
    const filterFamilies = families.filter((family) => {
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

        const isMatchingDeath =
        selectedDeath === '' || family.isDeath === selectedDeath;

        const isMatchingOccupation =
        selectedOccupation === '' || family.occupations.name === selectedOccupation;

        const isMatchingEducation =
        selectedEducation === '' || family.educations.name === selectedEducation;

        const isMatchingEthnicity =
        selectedEthnicity === '' ||
        family.ethnicities.name === selectedEthnicity;

        const isMatchingReligion = selectedReligion === '' || family.religions.name === selectedReligion;
            
        const isMatchingGender =
        selectedGender === '' || family.gender === selectedGender;
        
        const isMatchingAge = checkAge(family.date_of_birth);

        const isMatchingHousehold =
        selectedHousehold === '' || family.householdNo === selectedHousehold;
        
        const isMatchingStateRegion =
            selectedStateRegion === '' || family.stateRegionName === selectedStateRegion;
    
        const isMatchingDistrict = selectedDistrict === '' || family.districtName === selectedDistrict;
    
        const isMatchingTownship =
            selectedTownship === '' || family.townshipName === selectedTownship;
    
        const isMatchingWardVillageTract =
            selectedWardVillageTract === '' || family.wardVillageTractName === selectedWardVillageTract;
    
        const isMatchingVillage = selectedVillage === '' || family.villageName === selectedVillage;

        return (
            isMatchingDeath &&
            isMatchingOccupation &&
            isMatchingEducation &&
            isMatchingEthnicity &&
            isMatchingReligion &&
            isMatchingGender &&
            isMatchingAge &&
            isMatchingHousehold &&
            isMatchingSearchQuery &&
            isMatchingStateRegion &&
            isMatchingDistrict &&
            isMatchingTownship &&
            isMatchingWardVillageTract &&
            isMatchingVillage
        );
    });

    useEffect(() => {
        const fetchData = async () => {
          try {
            await fetchOccupation();
            await fetchEducation();
            await fetchEthnicity();
            await fetchRelition();
            await fetchGenders();
            await fetchDeaths();
            await fetchHouseholds();
            await fetchStateRegions();
            await fetchDistricts();
            await fetchTownships();
            await fetchWardVillageTracts();
            await fetchVillages();
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
      
        fetchData();
    }, []);
    
    async function fetchDeaths() {
        try {
          const { data, error } = await supabase
          .from('families')
          .select('isDeath');
      
          if (error) {
            throw new Error(error.message);
          }
      
          const uniqueDeaths = [...new Set(data.map((row) => row.isDeath))];
      
          setDeaths(uniqueDeaths);
        } catch (error) {
          console.log('Error fetching deaths:', error.message);
        }
    }

    async function fetchGenders() {
        try {
          const { data, error } = await supabase
          .from('families')
          .select('gender');
      
          if (error) {
            throw new Error(error.message);
          }
      
          // Extract unique gender values by filtering out duplicates
          const uniqueGenders = [...new Set(data.map((row) => row.gender))];
      
          setGenders(uniqueGenders);
        } catch (error) {
          console.log('Error fetching gender:', error.message);
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
    

    async function fetchHouseholds() {
        try {
          const { data, error } = await supabase.from('households').select('id, household_no').order("household_no");
          if (error) {
            throw new Error(error.message);
          }
          setHouseholds(data);
        } catch (error) {
          console.log('Error fetching households:', error.message);
        }
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
    // Pagination Start
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage] = useState(10);
    const offset = currentPage * perPage;
    const currentPageData = filterFamilies.slice(offset, offset + perPage);
    const goToPreviousPage = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
    };
    const goToNextPage = () => {
    if (currentPage < Math.ceil(filterFamilies.length / perPage) - 1) {
        setCurrentPage(currentPage + 1);
    }
    };
    // Pagination End
    
    const [showFilter, setShowFilter] = useState(false);

    const handleToggleFilter = () => {
        setShowFilter(!showFilter);
    };

    //Print and save pdf
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleSaveAsPdf = () => {
        const doc = new jsPDF();
        doc.autoTable({
          head: [['Name', 'Age', 'School']],
          body: filterFamilies.map((item) => [item.name, item.age, item.school]),
        });
        doc.save('table.pdf');
    };

    return (
        <div className='py-4'>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 mr-2 border border-gray-300 rounded-md"
                    placeholder="Search by name"
                />
                <button
                    onClick={handleToggleFilter}
                    className="px-4 py-2 text-white bg-blue-400 rounded-md"
                >
                <GridFilterListIcon className="w-5 h-5 mr-2"></GridFilterListIcon>
                    Filter
                </button>
                </div>
                <p className="text-gray-500">Total Results: {filterFamilies.length}</p>
            </div>

            {showFilter && (
            <div className="py-4 sm:grid sm:grid-cols-7 sm:gap-4">
                <div>
                    <select
                    value={selectedHousehold}
                    onChange={(e) => setSelectedHousehold(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    >
                    <option value="">All - Household</option>
                        {/* Render state region options */}
                        {households.map((household) => (
                            <option key={household.id} value={household.household_no}>
                        {household.household_no}
                        </option>
                    ))}
                    </select>
                </div>
                <div>
                    <select
                    value={selectedStateRegion}
                    onChange={(e) => setSelectedStateRegion(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    >
                    <option value="">All - State/Regions</option>
                        {/* Render state region options */}
                        {stateRegions.map((stateRegion) => (
                            <option key={stateRegion.id} value={stateRegion.name}>
                        {stateRegion.name}
                        </option>
                    ))}
                    </select>
                </div>
                    
                <div>
                    <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Districts</option>
                        {/* Render district options */}
                        {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                            {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select value={selectedTownship} onChange={(e) => setSelectedTownship(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                    <option value="">All - Townships</option>
                    {/* Render township options */}
                    {townships.map((township) => (
                        <option key={township.id} value={township.name}>
                        {township.name}
                        </option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <select value={selectedWardVillageTract} onChange={(e) => setSelectedWardVillageTract(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Ward/Village Tracts</option>
                        {/* Render ward/village tract options */}
                        {wardVillageTracts.map((wardVillageTract) => (
                            <option key={wardVillageTract.id} value={wardVillageTract.name}>
                            {wardVillageTract.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All Villages</option>
                            {villages.map((village) => (
                            <option key={village.id} value={village.name}>
                            {village.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select 
                    value={selectedOccupation}
                    onChange={(e) => setSelectedOccupation(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Occupations</option>
                        {/* Render Occupations options */}
                        {occupations.map((occupation) => (
                            <option key={occupation.id} value={occupation.name}>
                            {occupation.name}
                            </option>
                        ))}
                    </select>
                </div>
                    
                <div>
                    <select value={selectedEducation} onChange={(e) => setSelectedEducation(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Educations</option>
                        {/* Render Educations options */}
                        {educations.map((education) => (
                            <option key={education.id} value={education.name}>
                            {education.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <select value={selectedEthnicity} onChange={(e) => setSelectedEthnicity(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Ethnicities</option>
                        {/* Render Ethnicities options */}
                        {ethnicities.map((ethnicity) => (
                            <option key={ethnicity.id} value={ethnicity.name}>
                            {ethnicity.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <select value={selectedReligion} onChange={(e) => setSelectedReligion(e.target.value)} className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6">
                        <option value="">All - Religions</option>
                        {/* Render Religions options */}
                        {religions.map((religion) => (
                            <option key={religion.id} value={religion.name}>
                            {religion.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">All - Gender</option>
                        {genders.map((gender) => (
                        <option key={gender} value={gender}>
                            {gender}
                        </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={selectedDeath}
                        onChange={(e) => setSelectedDeath(e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">All - Deaths</option>
                        {deaths.map((death) => (
                        <option key={death} value={death}>
                            {death}
                        </option>
                        ))}
                    </select>
                </div>

                <div>
                    <input
                    type="number"
                    value={minAge}
                    onChange={handleMinAgeChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    placeholder="Min Age"
                    />
                </div>
                <div>
                    <input
                    type="number"
                    value={maxAge}
                    onChange={handleMaxAgeChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                    placeholder="Max Age"
                    />
                </div>
            </div>
           
            )}
             <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    {filterFamilies.length === 0 ? (
                        <div>No data!</div>
                    ) : (
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead className='bg-gray-300'>
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
                                    NRC ID
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Date of Birth
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
                                    Gender
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Father Name
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Mother Name
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Household No
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Family Head
                                </th>
                                <th
                                    scope="col"
                                    className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                                >
                                    Address
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
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.nrc_id}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                    {new Date(family.date_of_birth).toLocaleDateString()}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                    {Math.floor(
                                    (new Date() - new Date(family.date_of_birth)) /
                                        (365.25 * 24 * 60 * 60 * 1000)
                                    )}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.gender}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.father_name}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.mother_name}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.household_no}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8'
                                )}
                                >
                                {family.familyHead}
                                </td>
                                <td
                                className={classNames(
                                    familyIdx !== family.length - 1 ? 'border-b border-gray-200' : '',
                                    'whitespace-pre-line px-3 py-1 text-sm text-gray-500'
                                )}
                                >
                                {`${family.houseNo}, ${family.villageName}\n${family.wardVillageTractName}\n${family.townshipName}, ${family.districtName},${family.stateRegionName}`}
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
                            <span className="font-medium">{filterFamilies.length}</span> results
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
                            disabled={currentPage === Math.ceil(filterFamilies.length / perPage) - 1}
                        >
                            Next
                        </button>
                        </div>
                    </nav>
                </div>
            </div>
            <div className="flex items-center mt-4">
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 mr-2 text-white bg-blue-900 rounded-md"
                >
                    Print
                </button>
                <button
                    onClick={handleSaveAsPdf}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md"
                >
                    Save as PDF
                </button>
            </div>

        {/* Hidden component for printing */}
        <div style={{ display: 'none' }}>
            <ComponentToPrint ref={componentRef} data={filterFamilies} totalResults={filterFamilies.length} />
        </div>
    </div>
    );
};

const ComponentToPrint = React.forwardRef(({ data, totalResults }, ref) => (
    <div ref={ref}>
      <h2>Total Results: {totalResults}</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>School</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.age}</td>
              <td>{item.school}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
));

export default Table;