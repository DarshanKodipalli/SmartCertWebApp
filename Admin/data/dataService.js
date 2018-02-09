var UniversityData = [
						{
							  name: "VTU University",
							  address: "Gnana Mandira",
							  city: "Belgaum",
							  state: "Karnataka",
							  pincode: "567789",
							  universityNumber: "VTU-007",
							  primaryContactNumber: "89078796877",
							  primaryContactName: "Ravi Kumar",
							  primaryEmailId: "customerforims@gmail.com",
							  primaryDesignation: "Approver",
							  universityUrl:"https://localhost:3003"
						},
						{
							  name: "JNTU",
							  address: "Kukkatpally",
							  city: "Hyderabad",
							  state: "Telangana",
							  pincode: "567733",
							  universityNumber: "JNT-007",
							  primaryContactNumber: "89078796832",
							  primaryContactName: "Prasad Reddy",
							  primaryEmailId: "companyforims@gmail.com",
							  primaryDesignation: "Issuer",
							  universityUrl:"https://192.168.0.15:4003"
						},
						{
							  name: "Bangalore University",
							  address: "SRR Nagar",
							  city: "Bangalore",
							  state: "Karnataka",
							  pincode: "567133",
							  universityNumber: "BU-007",
							  primaryContactNumber: "89078712832",
							  primaryContactName: "Kiran Gowda",
							  primaryEmailId: "operatorforims@gmail.com",
							  primaryDesignation: "Creator",
							  universityUrl:"https://192.168.0.36:7789"
						}]

exports.getUniversityData = function(){
	return UniversityData;
}