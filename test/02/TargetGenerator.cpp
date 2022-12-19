#include "TargetGenerator.hpp"

TargetGenerator::TargetGenerator()
{
}

TargetGenerator::~TargetGenerator()
{
    std::map<std::string, ATarget *>::iterator it_begin = this->list.begin();
    std::map<std::string, ATarget *>::iterator it_end = this->list.end();
    while (it_begin != it_end)
    {
        delete it_begin->second;
        ++it_begin;
    }
    this->list.clear();
}

void    TargetGenerator::learnTargetType(ATarget *other)
{
    if (other)
        this->list.insert(std::pair<std::string, ATarget *>(other->getType(), other->clone()));
}

void    TargetGenerator::forgetTargetType(std::string const &name)
{
    std::map<std::string, ATarget *>::iterator it = this->list.find(name);
    if (it != this->list.begin())
        delete it->second;
    this->list.erase(name);
}

ATarget* TargetGenerator::createTarget(std::string const &spell_name)
{
    std::map<std::string, ATarget *>::iterator it = this->list.find(spell_name);
    if (it != this->list.end())
        return this->list[spell_name];
    return NULL;
}