import Footer from 'src/components/Footer'
import OrderHeader from 'src/components/OrderHeader'
interface Props {
  children?: React.ReactNode
}
export default function OrderLayout({ children }: Props) {
  return (
    <div>
      <OrderHeader />
      {children}
      <Footer />
    </div>
  )
}
