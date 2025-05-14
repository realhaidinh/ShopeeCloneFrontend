import { Carousel } from 'antd'
import Category from 'src/pages/HomePage/Category'

export default function HomePage() {
  return (
    <div>
      <div className='my-5'>
        <Carousel className='mx-auto w-3/4' autoplay={{ dotDuration: true }} autoplaySpeed={3000} arrows>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfgt-m9ju2anplprdb9_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rff0-m9ju25er8tr6d1_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfgr-m9k2ny16t5jt56_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/vn-11134258-7ra0g-m9jtwjmghsp39a_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfez-m9jtqueetalj51_xxhdpi' alt='' />
          </div>
          <div>
            <img width='100%' src='https://cf.shopee.vn/file/sg-11134258-7rfg9-m9jtpbj53x5u4e_xxhdpi' alt='' />
          </div>
        </Carousel>
      </div>
      <Category />
    </div>
  )
}
