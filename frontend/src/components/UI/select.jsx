 




 <div className="flex flex-wrap gap-4 justify-center">
      {Doctors.map((doctor,index) => (
        <div key={index} className="shadow p-4 w-64 group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-400 rounded-xl overflow-hidden bg-white">
          <img src={doctor.image} alt={doctor.name} className="w-sm h-sm object-cover group-hover:scale-105 transition-transform duration-300"/>
          <h3 className="text-lg font-bold mt-2">{doctor.name}</h3>
          <p className="text-gray-600">{doctor.specialty}</p>
          <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">
            {doctor.availableToday}
          </span>
          </div>
      ))}
    </div>

    