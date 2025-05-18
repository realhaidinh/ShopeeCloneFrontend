import Footer from 'src/components/Footer'
import Header from 'src/components/Header'
interface Props {
  children?: React.ReactNode
}
export default function ChatLayout({ children }: Props) {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='flex-1 overflow-hidden'>
        {children}
      </div>
    </div>
  )
}
