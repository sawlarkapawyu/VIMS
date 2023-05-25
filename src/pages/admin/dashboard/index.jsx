import Head from 'next/head'
import Sidebar from '@/components/admin/layouts/Sidebar'
import Dashboards from '@/components/admin/Dashboard';
import { useRouter } from 'next/router';

export default function Dashboard() {
    const router = useRouter();
    
    const handleClick = () => {
        router.push('/admin/reports');
    };

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
                            onClick={handleClick}
                            className="inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-white rounded-md shadow-sm bg-sky-600 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                            Reports
                            </button>
                       
                    </div>
                </div>
                <Dashboards />
                
            </Sidebar>
        
        </>
    )
}