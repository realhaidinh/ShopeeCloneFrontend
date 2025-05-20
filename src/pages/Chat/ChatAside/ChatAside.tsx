import { User } from "src/apis/chat.api"

export const ChatAside = ({ users, currentUserId, onSelectUser }: { users: User[] | undefined, currentUserId: string | undefined, onSelectUser(id: number): void }) => {
  return (
    <div className="w-64 h-full bg-white border-r shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b text-lg font-semibold">Users</div>
      <div className="flex-1 overflow-y-auto">
        {users && users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className={`w-full text-left px-4 py-3 hover:bg-blue-100 ${Number(currentUserId) == user.id ? 'bg-blue-500 text-white' : ''
              }`}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  )
}
