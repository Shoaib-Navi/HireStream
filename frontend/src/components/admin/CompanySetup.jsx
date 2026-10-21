import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById";
import api, { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const TEXT_FIELDS = [
  { name: "name", label: "Company Name" },
  { name: "description", label: "Description" },
  { name: "website", label: "Website", placeholder: "https://example.com" },
  { name: "location", label: "Location" },
];

// Rendered once the company is loaded, so the form starts with its saved values
const CompanyForm = ({ company }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    name: company.name ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    location: company.location ?? "",
    file: null,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] ?? null });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    // only send a logo when a new one was picked
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await api.put(`/company/update/${company._id}`, formData);
      toast.success(res.data.message);
      navigate("/admin/companies");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <div className="flex items-center gap-5 p-8">
        <Button
          type="button"
          onClick={() => navigate("/admin/companies")}
          variant="outline"
          className="flex items-center gap-2 text-gray-500 font-semibold"
        >
          <ArrowLeft />
          <span>Back</span>
        </Button>
        <h1 className="font-bold text-xl">Company Setup</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {TEXT_FIELDS.map(({ name, label, placeholder }) => (
          <div key={name}>
            <Label htmlFor={name} className="my-2">{label}</Label>
            <Input
              id={name}
              type="text"
              name={name}
              value={input[name]}
              placeholder={placeholder}
              onChange={changeEventHandler}
            />
          </div>
        ))}
        <div>
          <Label htmlFor="logo" className="my-2">Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={changeFileHandler}
          />
        </div>
      </div>

      {loading ? (
        <Button disabled className="w-full mt-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button type="submit" className="w-full mt-8">
          Update
        </Button>
      )}
    </form>
  );
};

const CompanySetup = () => {
  const { id } = useParams();
  const { failed } = useGetCompanyById(id);
  const { singleCompany } = useSelector((store) => store.company);
  // Ignore a company left in the store from a previously opened page
  const company = singleCompany?._id === id ? singleCompany : null;

  return (
    <div className="max-w-xl mx-auto my-10 px-4">
      {company ? (
        <CompanyForm key={company._id} company={company} />
      ) : (
        <p className="text-center text-sm text-gray-500 py-10">
          {failed ? "Company not found." : "Loading company..."}
        </p>
      )}
    </div>
  );
};

export default CompanySetup;
