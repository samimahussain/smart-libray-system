import { useLibrarianStore } from '../../store/librarianStore'

export default function Inventory() {
  const { inventory, markDamaged } = useLibrarianStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Physical Inventory</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {inventory.map(b => (
          <div key={b.id} className="card p-6">
            <p className="font-semibold">{b.title}</p>
            <p className="text-sm opacity-70">Shelf: {b.shelf}</p>
            <p className="text-sm">Stock: {b.stock}</p>
            <p className="text-sm">Condition: {b.condition}</p>

            <button
              onClick={() => markDamaged(b.id)}
              className="btn-outline mt-4"
            >
              Mark Damaged
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
