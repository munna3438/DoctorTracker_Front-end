import DoctorDetail from './DoctorDetail';

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoctorDetail id={id} />;
}
