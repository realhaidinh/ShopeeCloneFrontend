import CheckoutHeader from 'src/components/CheckoutHeader'
import Footer from 'src/components/Footer'
interface Props {
  children?: React.ReactNode
}
export default function CheckoutLayout({ children }: Props) {
  return (
    <div>
      <CheckoutHeader />
      {children}
      <Footer />
    </div>
  )
}
