'use client'

import type { User } from 'src/apis/chat.api'
import { Search, Users, MessageCircle, MoreVertical } from 'lucide-react'
import { useState } from 'react'

// Avatar component for consistency
const UserAvatar = ({ user, size = 'md' }: { user: { name: string; avatar?: string }; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  if (user.avatar) {
    return (
      <img
        src={user.avatar || '/placeholder.svg'}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full border-2 border-white object-cover shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 font-semibold text-white shadow-sm`}
    >
      {user.name?.charAt(0).toUpperCase()}
    </div>
  )
}

// Online status indicator
const OnlineStatus = ({ isOnline = false }: { isOnline?: boolean }) => (
  <div
    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
      isOnline ? 'bg-green-400' : 'bg-gray-300'
    }`}
  />
)

export const ChatAside = ({
  users,
  currentUserId,
  onSelectUser
}: {
  users: User[] | undefined
  currentUserId: string | undefined
  onSelectUser(id: number): void
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter users based on search query
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='flex h-full w-80 flex-col border-r border-slate-200 bg-white shadow-lg'>
      {/* Header */}
      <div className='border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600'>
              <MessageCircle className='h-4 w-4 text-white' />
            </div>
            <h2 className='text-lg font-semibold text-slate-800'>Messages</h2>
          </div>
          <button className='rounded-lg p-2 transition-colors hover:bg-slate-100'>
            <MoreVertical className='h-4 w-4 text-slate-600' />
          </button>
        </div>

        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
          <input
            type='text'
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
          />
        </div>
      </div>

      {/* Users Count */}
      <div className='border-b border-slate-100 bg-slate-50 px-6 py-3'>
        <div className='flex items-center space-x-2 text-sm text-slate-600'>
          <Users className='h-4 w-4' />
          <span>{filteredUsers?.length || 0} conversations</span>
        </div>
      </div>

      {/* Users List */}
      <div className='flex-1 overflow-y-auto'>
        {filteredUsers && filteredUsers.length > 0 ? (
          <div className='space-y-1 p-2'>
            {filteredUsers.map((user) => {
              const isSelected = Number(currentUserId) === user.id
              const isOnline = Math.random() > 0.5 // Mock online status - replace with real data

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  className={`group w-full rounded-xl p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    {/* Avatar with online status */}
                    <div className='relative'>
                      <UserAvatar user={user} size='md' />
                      <OnlineStatus isOnline={isOnline} />
                    </div>

                    {/* User Info */}
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className={`truncate font-medium ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {user.name}
                        </h3>
                        <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>2m ago</span>
                      </div>

                      <div className='mt-1 flex items-center justify-between'>
                        <p className={`truncate text-sm ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect indicator */}
                  {!isSelected && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className='flex h-full flex-col items-center justify-center p-6 text-center'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
              <Users className='h-8 w-8 text-slate-400' />
            </div>
            <h3 className='mb-2 text-lg font-medium text-slate-900'>
              {searchQuery ? 'No results found' : 'No conversations'}
            </h3>
            <p className='max-w-xs text-sm text-slate-500'>
              {searchQuery ? `No conversations match "${searchQuery}"` : 'Start a conversation to see it here'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='border-t border-slate-200 bg-slate-50 px-6 py-4'>
        <div className='flex items-center space-x-3'>
          <UserAvatar user={{ name: 'You', avatar: undefined }} size='sm' />
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-slate-900'>Your Account</p>
            <p className='truncate text-xs text-slate-500'>Online</p>
          </div>
          <div className='h-2 w-2 rounded-full bg-green-400'></div>
        </div>
      </div>
    </div>
  )
}
