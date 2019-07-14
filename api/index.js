var express = require('express');
var router = express.Router();

//////////////////////
// Postgres queries
//////////////////////


var db = require('./queries');
var tests = require('./roles/tests');
var account = require('./roles/account');
var users = require('./roles/users');
var doctors = require('./roles/doctors');
var hotels = require('./roles/hotels');
var admin = require('./roles/admin');
var other = require('./roles/other');

router.post('/api/tests/generate-sanatoriums', tests.generateSanatoriums);


router.post('/api/booking/reserve', users.reserveRoom);
router.post('/api/booking/tur/reserve', users.reserveTur);
router.get('/api/booking/coupon/check-available', users.checkCouponIsAvailable);
router.post('/api/booking/cancel', users.cancelReserveRoom);
router.post('/api/ask-doctor/question/create', users.createAskDoctorQuestion);
router.get('/api/ask-doctor/question', users.getAskDoctorQuestions);
router.get('/api/ask-doctor/question/not-answered', users.getDoctorsAskDoctorQuestions);
router.get('/api/profile/ask-doctor/question', users.getUsersAskDoctorQuestions);
router.post('/api/profile/funny-satellite/preferred/update', users.updatePreferredSatellite);
router.get('/api/profile/funny-satellite/requests', users.getActiveRequestToShareRoom);
router.post('/api/profile/funny-satellite/requests/create', users.addRequestToShareRoom);
router.post('/api/profile/funny-satellite/requests/cancel', users.cancelRequestToShareRoom);
router.post('/api/profile/funny-satellite/requests/status/decline', users.declineRequestToShareRoomByHost);
router.post('/api/profile/funny-satellite/requests/status/approve', users.approveRequestToShareRoomByHost);
router.post('/api/booking/funny-satellite/email/completed', users.funnySatMailVerification );
router.get('/api/booking/own', users.getOwnBookings );

router.get('/api/account/auth', account.getAuth);
router.get('/api/secret-admin/auth', account.getAuthAdmin);
router.post('/api/account/reg', account.regAccount);
router.post('/api/profile/info/update', account.updateAccountData);
router.get('/api/profile/info', account.getAcccountData);
router.post('/api/account/confirm', account.confirmReg);
router.get('/api/messages/list-dialogs', account.getDialogsList);
router.get('/api/messages/dialog', account.getDialogMessages);
router.post('/api/messages/send', account.sendMessage);
router.post('/api/messages/dialogs/create', account.createDialog);
router.post('/api/messages/dialogs/delete', account.deleteDialog);

router.get('/api/hotels', hotels.getListHotels)
router.get('/api/hotels-names', hotels.getHotelsNames )
router.get('/api/profile/hotel/general-info', hotels.getGeneralInfo );
router.post('/api/profile/hotel/general-info/update', hotels.updateGeneralInfo );
router.get('/api/profile/hotel/payments', hotels.getPayments );
router.post('/api/profile/hotel/payments/update', hotels.updatePayments );
router.get('/api/profile/hotel/price-conditions', hotels.getPriceConditions );
router.post('/api/profile/hotel/price-conditions/add-info', hotels.addPriceConditions );
router.post('/api/profile/hotel/price-conditions/update', hotels.updatePriceConditions);
router.post('/api/profile/hotel/price-conditions/delete', hotels.deletePriceConditions);
router.get('/api/profile/hotel/rooms', hotels.getRooms );
router.post('/api/profile/hotel/rooms/add-room', hotels.addRoom );
router.post('/api/profile/hotel/rooms/delete-room', hotels.deleteRoom );
router.post('/api/profile/hotel/rooms/change-room', hotels.updateRoom );
router.get('/api/hotels-facilities-props', db.getHotelsFacilitiesProps )
router.post('/api/profile/hotels-facilities/update', db.updateHotelFacilities );
router.get('/api/profile/hotel/rooms-props', hotels.getRoomProps );
router.post('/api/profile/hotel/rooms-props/update', hotels.updateRoomProps );
router.post('/api/profile/hotel/rooms/attach-photo', hotels.addPhotoToRoom );
router.get('/api/profile/hotel/price-categories', hotels.getPriceCategories );
router.post('/api/profile/hotel/rooms-categories/add-info', hotels.addPriceCategory );
router.post('/api/profile/hotel/price-categories/update', hotels.updatePriceCategory );
router.post('/api/profile/hotel/price-categories/delete', hotels.deletePriceCategory );
router.get('/api/profile/hotel/price-children', hotels.getPriceChildren );
router.post('/api/profile/hotel/rooms-children/add-info', hotels.addPriceChildren );
router.post('/api/profile/hotel/price-children/update', hotels.updatePriceChildren );
router.post('/api/profile/hotel/price-children/delete', hotels.deletePriceChildren );
router.get('/api/profile/hotel/photos', hotels.getPhotos );
router.post('/api/profile/hotel/photos/upload-photo', hotels.addPhoto );
router.post('/api/profile/hotel/photos/change-photo', hotels.updatePhoto );
router.post('/api/profile/hotel/photos/delete-photo', hotels.deletePhoto );
router.get('/api/profile/hotel/calendar', hotels.getCalendar );
router.post('/api/profile/hotel/calendar/update/max-rent', hotels.updateCalendarMaxRent );
router.post('/api/profile/hotel/calendar/update/price', hotels.updateCalendarPrice );
router.get('/api/hotels-treatments-props', hotels.getTreatments )
router.post('/api/profile/hotels-treatments/update', hotels.updateTreatments );
router.get('/api/sanatoriums/search', hotels.getSanatoriumsInSearch)
router.get('/api/search/sanatorium-page', hotels.getSanatoriumPageData )
router.get('/api/booking/preview-data', hotels.getSanatoriumBookingData )
router.get('/api/hotels/comments', hotels.getHotelComments )
router.get('/api/turs/comments', hotels.getTursComments )
router.post('/api/turs/comments/add', hotels.addTursComments )
router.post('/api/hotels/comments/add', hotels.addHotelComments )
router.get('/api/hotels/cancelation_policy', hotels.getCancelationPolicy )
router.post('/api/hotels/cancelation_policy/update', hotels.updateCancalationPolicy )


router.get('/api/info/get-online', db.getOnline);

router.post('/api/profile/password/change', db.updateProfilePassword);


router.post('/api/profile/copy-prices', db.updateHotelPricesToNextYear);


router.get('/api/map/get-hotels', db.getAllCoordsHotels)

router.get('/api/compares', db.getComparesData )

router.get('/api/disease-profiles-names', db.getDiseaseProfilesNames )

router.get('/api/countries-kurorts-names', db.getCountriesAndKurortsNames )
router.post('/api/countries-kurorts-names/add-country', db.addCountryName )
router.post('/api/countries-kurorts-names/update-country', db.updateCountryName )
router.post('/api/countries-kurorts-names/delete-country', db.deleteCountryName )
router.post('/api/countries-kurorts-names/add-kurort', db.addKurortName )
router.post('/api/countries-kurorts-names/update-kurort', db.updateKurortName )
router.post('/api/countries-kurorts-names/delete-kurort', db.deleteKurortName )

router.get('/api/hotels-facilities-names', db.getHotelsFacilitiesNames )
router.get('/api/items-details-names', db.getItemsDetailsNames )
router.get('/api/hotels-treatments-names', db.getHotelsTreatmentsNames )

router.get('/api/banners', db.getBanners )
router.post('/api/banners/create', db.createBanner )
router.post('/api/banners/update', db.updateBanner )
router.post('/api/banners/delete', db.deleteBanner )
router.post('/api/ask_doctor/question/answer', db.updateConsultantUnswer)

router.get('/liqpay/get-data', db.getLiqpayData )


router.get('/api/site-stats', db.getSiteStats);


router.get('/api/site/events', db.getSiteEvents);

 
router.get('/api/blog', db.getPageBlogData);
router.get('/api/blog/article', db.getBlogArticles);
router.get('/api/blogger', db.getBloggerPage);
router.get('/api/blogger/article', db.getBloggerArticle);
router.get('/api/blogger/article/comments', db.getBloggerPostComments);
router.post('/api/blogger/article/comments/add', db.addBloggerPostComment);
router.post('/api/blog/article/create', db.addBlogArticle);
router.post('/api/blog/article/update', db.updateBlogArticle);
router.post('/api/blog/article/approve/update', db.approveBlogArticle);
router.get('/admin/coupons', db.getAdminCuppons);
router.post('/admin/coupons/registration/percent', db.updateRegCouponsPrice);
router.post('/admin/coupons/custom/create', db.createCustomCuppon);
router.post('/admin/coupons/custom/delete', db.deleteCustomCuppon);

router.post('/admin/coupons/give', admin.giveCouponByEmail);
router.get('/api/admin/ask-doctor/questions', admin.getAskDoctorQuestions);
router.get('/api/admin/ask-doctor/questions/closed', admin.getAskDoctorQuestionsClosed);
router.post('/api/admin/ask-doctor/questions', admin.closeAskDoctorQuestion);
router.get('/admin/bookings/no-share', admin.getNoShareBookings);
router.get('/admin/bookings/share', admin.getShareBookings);
router.get('/admin/funny_satellite/bookings', admin.getAvailableJoinShareBooking);
router.post('/admin/bookings/no-share/update/status', admin.updateStatusNoShareBooking);
router.get('/admin/ask-doctor/faq', admin.getAskDoctorFaq);
router.post('/admin/ask-doctor/faq/create', admin.createAskDoctorFaq);
router.post('/admin/ask-doctor/faq/update', admin.updateAskDoctorFaq);
router.post('/admin/ask-doctor/faq/delete', admin.deleteAskDoctorFaq);
router.post('/api/admin/blog/delete', admin.deleteBlogArticle);
router.post('/api/admin/ask_doctor/delete', admin.deleteAskDoctorQuestion);
router.post('/admin/coupons/give', admin.giveCouponByEmail);
router.get('/admin/wonder', admin.getWonder);
router.get('/admin/turs/single', admin.getTurPageData);
router.post('/admin/turs/create', admin.createTur);
router.post('/admin/turs/update', admin.updateTur);
router.post('/api/turs/delete', admin.deleteTur);
router.get('/admin/doctor-coupons', admin.getDoctorCouponsTypes);
router.post('/admin/doctor-coupons/create', admin.addDoctorCouponType);
router.post('/admin/doctor-coupons/update', admin.updateDoctorCouponType);
router.post('/admin/doctor-coupons/delete', admin.deleteDoctorCouponType);
router.post('/admin/doctor-coupons/category/change', admin.changeDoctorCouponCategory);
router.get('/admin/transfer', admin.getTransfers);
router.get('/admin/transfer/sanatorium', admin.getTransfersForSanatorium);
router.post('/admin/transfer/create', admin.createTransfer);
router.post('/admin/transfer/update', admin.updateTransfer);
router.post('/admin/transfer/delete', admin.deleteTransfer);
router.post('/admin/booking/status/settled/update', admin.updateBookingIsSettled);
router.get('/api/admin/get-videos', admin.getAdminVideos);
router.post('/api/admin/videos/create', admin.createAdminVideos);
router.post('/api/admin/videos/delete', admin.deleteAdminVideos);
router.get('/api/admin/invoices/new-month', admin.createInvoicesList);
router.get('/api/admin/all-users-messages/list-dialogs', admin.getAllUsersListDialogs);
router.get('/api/admin/hotel-comissions', admin.getHotelsComissions);
router.post('/api/admin/hotel-comissions/update', admin.updateHotelsComissions);
router.post('/api/admin/hotel-evaluate/update', admin.updateHotelEvaluates);
router.post('/api/admin/hotel-evaluate/delete', admin.deleteHotelEvaluates);
router.get('/api/turs', admin.getTurs );
router.get('/api/site-pages', admin.getSitePages );
router.post('/api/site-pages/update', admin.updateSitePage );
router.get('/api/robots', admin.getRobotsFile );
router.post('/api/robots/update', admin.updateRobotsFile );
router.get('/api/sitemap', admin.getSiteMapFile );
router.post('/api/sitemap/update', admin.updateSiteMapFile );
router.post('/api/admin/account/approve', admin.approveAccount );
router.post('/api/admin/account/block', admin.blockAccount );

router.get('/api/doctors', db.getListDoctors);
router.get('/api/users/without-admins', db.getListAllUsersWithoutAdmins );

router.get('/api/invoices', other.getHotelAvailableInvoices );
router.get('/api/invoices/:id', other.downloadHotelInvoice );
router.get('/api/currencies-rates', other.getCurrenciesRates);
router.post('/api/currencies-rates/update', other.updateCurrenciesRates);
router.get('/api/loading-screen', other.getLoadingScreen);
router.put('/api/loading-screen', other.updateLoadingScreen);


module.exports = router;