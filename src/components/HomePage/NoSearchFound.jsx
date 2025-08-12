// import './styles/NoSearchFound.css' // Removed - using Tailwind CSS only

export default function NoSearchFound() {
  return (
    <section className="flex items-center justify-center py-16 px-4">
      <p className="font-arabic text-gray-500 text-center text-sm">
        لم يتم العثور على نتائج
      </p>
    </section>
  )
}