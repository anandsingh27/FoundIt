import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { countItems, listItems } from "@/lib/models/items";
import { listUsers } from "@/lib/models/users";
import { deleteItemAction, setItemStatusAction } from "@/actions/items";
import { SubmitButton } from "@/components/form";

export default async function AdminPage() {
  await requireAdmin();
  const stats = countItems();
  const items = listItems({});
  const users = listUsers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-stamp text-xs uppercase tracking-[0.25em] text-amber-dark">Control room</p>
      <h1 className="mt-1 mb-8 font-display text-3xl font-semibold text-forest-dark">Admin</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="Total posts" value={stats.total} />
        <Stat label="Lost" value={stats.lost} />
        <Stat label="Found" value={stats.found} />
        <Stat label="Open" value={stats.open} />
        <Stat label="Resolved" value={stats.resolved} />
      </div>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">All posts</h2>
        <div className="card-index overflow-x-auto rounded-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-soft/60 font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted by</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/items/${item.id}`} className="font-medium text-ink hover:text-forest">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{item.type}</td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{item.status}</td>
                  <td className="px-4 py-3 text-ink-soft">{item.poster_name}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {item.status !== "resolved" ? (
                        <form action={setItemStatusAction.bind(null, item.id, "resolved")}>
                          <button className="focus-ring rounded-sm border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-found hover:text-found">
                            Resolve
                          </button>
                        </form>
                      ) : (
                        <form action={setItemStatusAction.bind(null, item.id, "open")}>
                          <button className="focus-ring rounded-sm border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-amber hover:text-amber-dark">
                            Reopen
                          </button>
                        </form>
                      )}
                      <form action={deleteItemAction.bind(null, item.id)}>
                        <button className="focus-ring rounded-sm border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink-soft hover:border-lost hover:text-lost">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="p-4 text-sm text-ink-faint">No posts yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">Users ({users.length})</h2>
        <div className="card-index overflow-x-auto rounded-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-soft/60 font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{u.role}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-index rounded-sm p-4 text-center">
      <p className="font-display text-3xl font-semibold text-forest-dark">{value}</p>
      <p className="font-stamp text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
