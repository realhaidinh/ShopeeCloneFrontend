export const ChatAside = ({receivers, currentReceiver, onSelectReceiver}) => {
    return (
        <div className="w-64 h-full bg-white border-r shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b text-lg font-semibold">Users</div>
      <div className="flex-1 overflow-y-auto">
        {receivers.map((receiver) => (
          <button
            key={receiver.id}
            onClick={() => onSelectReceiver(receiver.id)}
            className={`w-full text-left px-4 py-3 hover:bg-blue-100 ${
              currentReceiver == receiver.id ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {receiver.name}
          </button>
        ))}
      </div>
    </div>
    )
}
