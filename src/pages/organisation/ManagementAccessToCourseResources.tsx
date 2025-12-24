import { DataTable } from '@/components/ui/data-table';
import data from "@/data/data.json"


const ManagementAccessToCourseResources = () => {
    return (
        <main className="p-10">
             <DataTable data={data} />
        </main>
    );
}

export default ManagementAccessToCourseResources;
