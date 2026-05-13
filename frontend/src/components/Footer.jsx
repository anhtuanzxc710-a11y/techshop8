import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSearch } = useContext(AppContext);
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[4fr_1fr_2fr] gap-14 my-10 mt-40 text-sm'>
        {/*left*/}
        <div>
          <img className='mb-5 w-56' src={assets.logo} alt='' />
          <p className='w-full md:2/3 text-gray-600 leading-6'>
            {t('footer.desc')}
          </p>
        </div>
        {/*center*/}
        <div>
          <p className='text-xl font-medium mb-5'>
            {t('footer.company')}
          </p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:cursor-pointer hover:underline' onClick={() => { navigate('/'); setSearch(''); scrollTo(0, 0) }}>{t('nav.home')}</li>
            <li className='hover:cursor-pointer hover:underline' onClick={() => { navigate('/about'); setSearch(''); scrollTo(0, 0) }}>{t('footer.about_us')}</li>
            <li className='hover:cursor-pointer hover:underline' onClick={() => { navigate('/contact'); setSearch(''); scrollTo(0, 0) }}>{t('footer.contact_us')}</li>
            <li className='hover:cursor-pointer hover:underline' onClick={() => { navigate('/privacy'); setSearch(''); scrollTo(0, 0) }}>{t('footer.privacy')}</li>
          </ul>
        </div>
        {/*right*/}
        <div >
          <p className='text-xl font-medium mb-5'>{t('footer.get_in_touch')}</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>{t('footer.phone')}: +84 862613118</li>
            <li>Gmail 1: <a href="mailto:tuannv7105@gmail.com" className="text-primary hover:underline">tuannv7105@gmail.com</a></li>
            <li>Gmail 2: <a href="mailto:loc@gmail.com" className="text-primary hover:underline">loc@gmail.com</a></li>
          </ul>
        </div>

      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright © 2026</p>
      </div>
    </div>
  )
}

export default Footer

